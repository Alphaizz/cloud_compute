import React, { useState, useEffect } from 'react';
// Import the shared Supabase client and the useAuth hook
import { supabase } from '../../supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

// Import the jsPDF library for PDF generation
import '../Chat.css'; 
import { jsPDF } from "jspdf";
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

// Helper function to generate time slots.
const generateTimeSlots = (start, end, duration) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);

    while (currentTime <= endTime) {
        slots.push(
            currentTime.getHours().toString().padStart(2, '0') + ':' +
            currentTime.getMinutes().toString().padStart(2, '0')
        );
        currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    return slots;
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function Chat() {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handlePrintBooking = async (bookingId) => {
    if (!bookingId) return;
    try {
        const { data: bookingData, error } = await supabase
            .from('bookings')
            .select(`*, tables (name)`)
            .eq('id', bookingId)
            .single();
        if (error || !bookingData) throw new Error('Could not find booking details.');

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Booking Confirmation", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Thank you for your reservation!", 105, 30, { align: 'center' });
        doc.line(20, 35, 190, 35);
        doc.setFontSize(14);
        doc.text("Booking Details", 20, 45);
        doc.setFontSize(12);
        doc.text(`Booking ID: ${bookingData.id}`, 20, 55);
        doc.text(`Customer Name: ${bookingData.customer_name}`, 20, 62);
        doc.text(`Party Size: ${bookingData.party_size} guest(s)`, 20, 69);
        doc.text(`Table: ${bookingData.tables.name}`, 20, 76);
        
        const startTime = new Date(bookingData.start_time);
        doc.text(`Date: ${startTime.toLocaleDateString()}`, 20, 83);
        doc.text(`Time: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`, 20, 90);

        doc.line(20, 100, 190, 100);
        doc.setFontSize(10);
        doc.text("Please present this confirmation upon arrival. We look forward to seeing you!", 105, 110, { align: 'center' });
        doc.save(`booking-confirmation-${bookingData.id}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    if (!session) return;
    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('cloud_chat')
          .select('*') 
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([{ message: `Hello ${session.user.email}! I'm your reservation assistant. How can I help you today?`, direction: "incoming" }]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, [session]);

  async function handleNewChat() {
    if (!session) return;
    try {
      await supabase.from('cloud_chat').delete().eq('user_id', session.user.id);
      setMessages([{ message: "New chat started. How can I assist you with your reservation?", direction: "incoming" }]);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  }

  async function handleSend(text) {
    if (!session || !text.trim()) return;

    const userMessage = { message: text, direction: "outgoing" };
    setMessages(prev => [...prev, userMessage]);
    await supabase.from('cloud_chat').insert([{ message: text, direction: 'outgoing', user_id: session.user.id }]);
    
    setIsTyping(true);

    try {
      const { data: tables } = await supabase.from('tables').select('*');
      const { data: businessHours } = await supabase.from('business_hours').select('*');
      const { data: allBookings } = await supabase.from('bookings').select('*').eq('status', 'confirmed');
      const today = new Date().toISOString().split('T')[0];

      // --- FIX: Updated prompt to handle specific table requests ---
      const systemPrompt = `
      You are an expert reservation assistant for a restaurant. Today's date is ${today}.
      
      YOUR TASKS:
      1.  **Gather Information**: Ask for the desired date, party size, and if they have a preferred table.
      2.  **Check Availability**: Once you have the date and party size, respond with the tag: "[CHECK_AVAILABILITY]date:YYYY-MM-DD,partySize:N[/CHECK_AVAILABILITY]"
      3.  **Book a Reservation**: When the user chooses a time and provides their details, respond with the tag: "[CREATE_BOOKING]dateTime:YYYY-MM-DDTHH:mm,partySize:N,name:CUSTOMER_NAME,contact:CUSTOMER_CONTACT,tableName:TABLE_NAME(optional)[/CREATE_BOOKING]".
          **CRITICAL RULE 1**: If the user asked for a specific table (e.g., "Window Seat"), you MUST include the 'tableName' parameter. If they did not, omit it.
          **CRITICAL RULE 2**: You MUST have the user's actual name and contact information before using this tag. Do NOT use placeholder values.
      4.  **Cancel a Reservation**: If a user wants to cancel, ask for their booking ID, then respond with the tag: "[CANCEL_BOOKING]ID:uuid-of-booking[/CANCEL_BOOKING]"
      5.  **Post-Booking Behavior**: After a booking is confirmed, the task is complete. If the user then says "thank you", "ok", or a similar closing remark, DO NOT create another booking. Simply respond politely.

      DATABASE STATE:
      ## Tables: ${JSON.stringify(tables, null, 2)}
      ## Hours: ${JSON.stringify(businessHours, null, 2)}
      ## Bookings: ${JSON.stringify(allBookings, null, 2)}
      `;

      const recentMessages = messages.slice(-6);
      const chatHistoryForAPI = recentMessages.map(msg => ({ role: msg.direction === 'outgoing' ? 'user' : 'assistant', content: msg.message }));
      chatHistoryForAPI.push({ role: 'user', content: text });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ "role": "system", "content": systemPrompt }, ...chatHistoryForAPI] })
      });

      if (!response.ok) throw new Error(`Groq API responded with status: ${response.status}`);
      const data = await response.json();
      const botReply = data.choices[0]?.message?.content;
      if (!botReply) throw new Error("LLM response was empty.");

      if (botReply.includes("[CHECK_AVAILABILITY]")) {
        const match = botReply.match(/\[CHECK_AVAILABILITY\]date:(.*?),partySize:(\d+)\[\/CHECK_AVAILABILITY\]/);
        if (match) {
            const [_, requestedDateStr, partySizeStr] = match;
            const partySize = parseInt(partySizeStr, 10);
            const requestedDate = new Date(requestedDateStr + 'T00:00:00');
            const dayOfWeek = requestedDate.getDay();
            const schedule = businessHours.find(h => h.day_of_week === dayOfWeek);
            if (!schedule) throw new Error("Sorry, the restaurant is closed on that day.");
            const allSlots = generateTimeSlots(schedule.open_time, schedule.close_time, schedule.slot_duration_minutes);
            const suitableTables = tables.filter(t => t.capacity >= partySize);
            if (suitableTables.length === 0) throw new Error(`Sorry, we don't have tables for ${partySize} guests.`);
            const bookingsOnDate = allBookings.filter(b => b.start_time.startsWith(requestedDateStr));
            
            const availableSlotsInfo = allSlots.map(slot => {
                const slotStart = new Date(`${requestedDateStr}T${slot}:00`).getTime();
                const slotEnd = slotStart + schedule.slot_duration_minutes * 60 * 1000;
                const bookedTableIds = new Set(bookingsOnDate.filter(b => new Date(b.start_time).getTime() < slotEnd && new Date(b.end_time).getTime() > slotStart).map(b => b.table_id));
                const availableTablesForSlot = suitableTables.filter(table => !bookedTableIds.has(table.id));
                return { time: slot, tablesLeft: availableTablesForSlot.length };
            }).filter(info => info.tablesLeft > 0);

            let availabilityMessage;
            if (availableSlotsInfo.length > 0) {
                const timeStrings = availableSlotsInfo.map(info => info.tablesLeft === 1 ? `${info.time} (1 table left)` : info.time);
                availabilityMessage = `On ${requestedDateStr}, we have the following times available for a party of ${partySize}: ${timeStrings.join(', ')}. Which time would you like?`;
            } else {
                availabilityMessage = `Unfortunately, we are fully booked on ${requestedDateStr} for a party of ${partySize}. Would you like to try another date?`;
            }
            
            const availabilityBotMessage = { message: availabilityMessage, direction: "incoming" };
            setMessages(prev => [...prev, availabilityBotMessage]);
            await supabase.from('cloud_chat').insert([{ ...availabilityBotMessage, user_id: session.user.id }]);
            return;
        }
      } else if (botReply.includes("[CREATE_BOOKING]")) {
        const match = botReply.match(/\[CREATE_BOOKING\]dateTime:(.*?),partySize:(\d+),name:(.*?),contact:(.*?)(?:,tableName:(.*?))?\[\/CREATE_BOOKING\]/s);
        if (match) {
            const [_, dateTimeStr, partySizeStr, customerName, customerContact, requestedTableName] = match;
            const partySize = parseInt(partySizeStr, 10);
            const startTime = new Date(dateTimeStr); 
            const dayOfWeek = startTime.getDay();
            const schedule = businessHours.find(h => h.day_of_week === dayOfWeek);
            const endTime = new Date(startTime.getTime() + schedule.slot_duration_minutes * 60 * 1000);
            
            let suitableTables = tables.filter(t => t.capacity >= partySize);
            // --- FIX: Filter by specific table name if requested ---
            if (requestedTableName && requestedTableName.trim()) {
                suitableTables = suitableTables.filter(t => t.name.toLowerCase() === requestedTableName.trim().toLowerCase());
            }

            const bookingsAtTime = allBookings.filter(b => new Date(b.start_time).getTime() < endTime.getTime() && new Date(b.end_time).getTime() > startTime.getTime());
            const bookedTableIds = new Set(bookingsAtTime.map(b => b.table_id));
            const availableTable = suitableTables.find(t => !bookedTableIds.has(t.id));

            // --- FIX: Throw specific error if the requested table is taken ---
            if (!availableTable) {
                if (requestedTableName) {
                    throw new Error(`Sorry, the "${requestedTableName.trim()}" is no longer available at that time. Please try another table or time.`);
                } else {
                    throw new Error("Sorry, that slot was just taken. Please try another time.");
                }
            }
            
            const { data: newBooking, error: insertError } = await supabase.from('bookings').insert([{ table_id: availableTable.id, customer_name: customerName.trim(), customer_contact: customerContact.trim(), party_size: partySize, start_time: startTime.toISOString(), end_time: endTime.toISOString(), status: 'confirmed', user_id: session.user.id }]).select().single();
            if (insertError) throw insertError;
            
            const confirmationMessage = { message: `Your booking is confirmed! Your Booking ID is: ${newBooking.id}`, direction: "incoming", booking_id: newBooking.id };
            setMessages(prev => [...prev, confirmationMessage]);
            await supabase.from('cloud_chat').insert([{ ...confirmationMessage, user_id: session.user.id }]);
            
            const finalMessage = { message: "Is there anything else I can help you with today?", direction: "incoming" };
            setMessages(prev => [...prev, finalMessage]);
            await supabase.from('cloud_chat').insert([{ ...finalMessage, user_id: session.user.id }]);
            return;
        }
      } else if (botReply.includes("[CANCEL_BOOKING]")) {
        const match = botReply.match(/\[CANCEL_BOOKING\]ID:([\w-]+)\[\/CANCEL_BOOKING\]/i);
        if (match) {
            const bookingIdToCancel = match[1];
            await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingIdToCancel);
            const confirmationMessage = { message: `Booking ${bookingIdToCancel} has been cancelled.`, direction: "incoming" };
            setMessages(prev => [...prev, confirmationMessage]);
            await supabase.from('cloud_chat').insert([{ ...confirmationMessage, user_id: session.user.id }]);
            return;
        }
      }

      const botMessage = { message: botReply, direction: "incoming" };
      setMessages(prev => [...prev, botMessage]);
      await supabase.from('cloud_chat').insert([{ ...botMessage, user_id: session.user.id }]);

    } catch (error) {
      console.error("An error occurred in handleSend:", error);
      setMessages(prev => [...prev, { message: `Sorry, an error occurred: ${error.message}`, direction: "incoming" }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="chat-app-container">
      <div style={{ padding: '10px', textAlign: 'center', border: '1px solid #1d1c1cff', margin: '10px', backgroundColor: '#1d1c1cff' }}>
        <button onClick={handleNewChat} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: '1px solid #ff8c00ff', backgroundColor: '#ff8c00ff', color: 'white', borderRadius: '5px' }}>
          Start New Chat
        </button>
      </div>
      <div className='chat-wrapper'>
        <MainContainer>
          <ChatContainer style={{ backgroundColor: "#1d1c1cff" }}>
            <MessageList typingIndicator={isTyping ? <TypingIndicator content="Assistant is thinking..." /> : null }>
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                    <Message model={msg} />
                    {msg.booking_id && msg.direction === 'incoming' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '10px', marginTop: '-5px', marginBottom: '10px'}}>
                            <button 
                                onClick={() => handlePrintBooking(msg.booking_id)}
                                style={{ padding: '5px 15px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ff8c00', backgroundColor: '#ff8c00', color: 'white', borderRadius: '5px' }}
                            >
                                Print Confirmation
                            </button>
                        </div>
                    )}
                </React.Fragment>
              ))}
            </MessageList>
            <MessageInput placeholder="Type your message here..." attachButton={false} onSend={handleSend} sendButton={true} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
