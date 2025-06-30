import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

// --- Your Correct API Keys ---
const supabase = createClient('https://ezgubkvplosoipeyvoiy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z3Via3ZwbG9zb2lwZXl2b2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Mzk1NjAsImV4cCI6MjA2MzIxNTU2MH0.g5ga7qlx1Q6UF4Ha1NZmUPaC356ne4zwl-huTsaNHb4');
const GROQ_API_KEY = "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";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase.from('cloud_chat').select('message, direction').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([{ message: "Hello! I'm your reservation assistant. How can I help you today?", direction: "incoming" }]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, []);

  async function handleNewChat() {
    try {
      await supabase.from('cloud_chat').delete().neq('id', -1);
      setMessages([{ message: "New chat started. How can I assist you with your reservation?", direction: "incoming" }]);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  }

  async function handleSend(text) {
    const userMessage = { message: text, direction: "outgoing" };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await supabase.from('cloud_chat').insert([{ message: text, direction: 'outgoing' }]);

      const { data: schedule } = await supabase.from('availability_schedule').select('*').eq('is_booked', false).order('start_time');
      const { data: bookings } = await supabase.from('bookings').select('*');

      // =================================================================================
      // === FINAL PROMPT FIX: Stricter instructions for the booking confirmation message ===
      // =================================================================================
      const systemPrompt = `
      You are an expert reservation assistant for a restaurant. You have two sources of information: the "CURRENT DATABASE STATE" and the "CONVERSATION HISTORY".

      **CRITICAL RULE: The "CURRENT DATABASE STATE" is ALWAYS the single source of truth for what is available and what is booked. If the "CONVERSATION HISTORY" mentions a booking that is NOT in the "Existing Bookings" data, you must assume that booking was cancelled or never completed. Do NOT refer to it.**

      Use the "CONVERSATION HISTORY" only to understand the user's immediate context (e.g., if they are answering a question you just asked).

      HERE IS THE CURRENT DATABASE STATE:
      ## Available Time Slots: ${JSON.stringify(schedule, null, 2)}
      ## Existing Bookings: ${JSON.stringify(bookings, null, 2)}
      
      YOUR TASKS:
      1.  **Answer Questions:** List available slots from the "Available Time Slots" data.
      2.  **Book a Reservation:** This is a multi-step process. First, confirm the slot the user wants. SECOND, ask for the user's name and contact details. THIRD, after they provide their details, you MUST reply with a confirmation message that includes BOTH the schedule ID and a special tag with the user's details.
          **EXAMPLE OF THE REQUIRED RESPONSE FORMAT:** "Perfect! I have booked schedule ID 4 for you. [BOOKING_DETAILS]Name: Alfa, Contact: 12345678[/BOOKING_DETAILS]"
      3.  **Check a Booking:** Use the booking ID from the user to find details in "Existing Bookings".
      4.  **Cancel a Reservation:** Ask for the booking ID. When they provide it, confirm and use the tag: "[CANCEL_BOOKING]ID: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6[/CANCEL_BOOKING]"
      `;
      // =================================================================================

      const chatHistoryForAPI = messages.map(msg => ({ role: msg.direction === 'outgoing' ? 'user' : 'assistant', content: msg.message }));
      chatHistoryForAPI.push({ role: 'user', content: text });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ "role": "system", "content": systemPrompt }, ...chatHistoryForAPI]
        })
      });

      if (!response.ok) throw new Error(`Groq API responded with status: ${response.status}`);
      const data = await response.json();
      const botReply = data.choices[0]?.message?.content;
      if (!botReply) throw new Error("LLM response was empty.");

      const botMessage = { message: botReply, direction: "incoming" };
      setMessages(prev => [...prev, botMessage]);
      await supabase.from('cloud_chat').insert([{ message: botReply, direction: 'incoming' }]);

      if (botReply.includes("[BOOKING_DETAILS]")) {
        const idMatch = botReply.match(/schedule ID (\d+)/i);
        if (idMatch && idMatch[1]) {
          const scheduleIdToBook = parseInt(idMatch[1], 10);
          const detailsMatch = botReply.match(/\[BOOKING_DETAILS\](.*)\[\/BOOKING_DETAILS\]/s);
          const detailsText = detailsMatch ? detailsMatch[1].trim() : "";
          let customerName = "Unknown";
          let customerContact = "N/A";
          const nameMatch = detailsText.match(/Name: (.*?)(,|$)/);
          if (nameMatch) customerName = nameMatch[1].trim();
          const contactMatch = detailsText.match(/Contact: (.*?)(,|$)/);
          if (contactMatch) customerContact = contactMatch[1].trim();

          const { data: newBooking, error: insertError } = await supabase
            .from('bookings').insert([{ schedule_id: scheduleIdToBook, customer_name: customerName, customer_contact: customerContact }]).select().single();
          if (insertError) throw insertError;

          await supabase.from('availability_schedule').update({ is_booked: true }).eq('id', scheduleIdToBook);

          if (newBooking && newBooking.id) {
            const confirmationMessage = { message: `Your booking is confirmed! Please save your Booking ID: ${newBooking.id}`, direction: "incoming" };
            setMessages(prev => [...prev, confirmationMessage]);
            await supabase.from('cloud_chat').insert([{ message: confirmationMessage.message, direction: 'incoming' }]);
          }
        }
      }

      if (botReply.includes("[CANCEL_BOOKING]")) {
        const idMatch = botReply.match(/\[CANCEL_BOOKING\]ID: ([\w-]+)\[\/CANCEL_BOOKING\]/i);
        if (idMatch && idMatch[1]) {
          const bookingIdToCancel = idMatch[1];
          const { data: bookingToCancel, error: findError } = await supabase.from('bookings').select('schedule_id').eq('id', bookingIdToCancel).single();
          if (findError) throw new Error(`Could not find booking with ID ${bookingIdToCancel}.`);
          if (bookingToCancel) {
            await supabase.from('bookings').delete().eq('id', bookingIdToCancel);
            await supabase.from('availability_schedule').update({ is_booked: false }).eq('id', bookingToCancel.schedule_id);
          }
        }
      }

    } catch (error) {
      console.error("An error occurred in handleSend:", error);
      const errorMessage = { message: `Sorry, an error occurred: ${error.message}`, direction: "incoming" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div>
      <div style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc', margin: '10px' }}>
        <button onClick={handleNewChat} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', borderRadius: '5px' }}>
          Start New Chat
        </button>
      </div>
      <div style={{ position: "relative", height: "500px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={isTyping ? <TypingIndicator content="Assistant is thinking..." /> : null}>
              {messages.map((msg, index) => <Message key={index} model={msg} />)}
            </MessageList>
            <MessageInput placeholder="Type your message here..." attachButton={false} onSend={handleSend} sendButton={true} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}