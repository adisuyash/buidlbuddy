document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
    event.preventDefault(); // Prevent the default action (like adding a newline in the input)
  }
});

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput.trim() === '') return;

  // Clear the input field immediately after pressing Enter
  document.getElementById('user-input').value = '';

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p style="display: flex; justify-content: flex-end; text-align: right; gap: 5px;">${userInput} <span><img src="/icons/user.png" alt="userImage" style="height: 16px;" /></span> </p>`;

  try {
    const response = await fetch('https://llama.us.gaianet.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama',
        messages: [
          { role: 'system', content: 'Act as an ultra-knowledgeable Web3 Buddy, akin to Austin Griffith, the founder of Buidl Guidl. You have deep expertise in Web3 technologies, DApps, Ethereum, smart contracts, and the broader Web3 ecosystem. Your aim is to provide accurate and insightful answers to any queries related to these topics. If a user inquires about anything outside of Web3, politely state that you can’t assist with those queries. Try to give answers as concise as you can, for example: an exact and crisp answer with within 2-4 lines. Make sure to first check whether they are factually correct or not. Lastly, Never Ever give answers outside Web3 technologies and Web3 domain' },
          { role: 'user', content: `The user asks: ${userInput}. Please analyze and provide a response.` },
        ],
      }),
    });

    const data = await response.json();
    chatBox.innerHTML += `<p style="text-align:left;"><img src="/icons/castle.png" alt="castleImage" style="height: 14px;" /> ${data.choices[0].message.content}</p>`;
  } catch (error) {
    chatBox.innerHTML += '<p><strong>Error:</strong> Unable to fetch the response.</p>';
  }
}
