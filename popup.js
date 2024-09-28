document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
    event.preventDefault();
  }
});

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput.trim() === '') return;

  document.getElementById('user-input').value = ''; 

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p style="display: flex; justify-content: flex-end; text-align: right; gap: 5px;">${userInput} <span><img src="/icons/user.png" alt="userImage" style="height: 16px;" /></span> </p>`;

  if (userInput.toLowerCase() === 'summarize') {
    summarizePage();
  } else if (userInput.toLowerCase().includes('about this page')) {
    askQuestionAboutPage(userInput);
  } else {
    try {
      const response = await fetch('https://llama.us.gaianet.network/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama',
          messages: [
            { role: 'system', content: 'Act as an ultra-knowledgeable Web3 Buddy, akin to Austin Griffith, the founder of Buidl Guidl. You have deep expertise in Web3 technologies, DApps, Ethereum, smart contracts, and the broader Web3 ecosystem. Your aim is to provide accurate and insightful answers to any queries related to these topics. If a user inquires about anything outside of Web3, politely state that you can’t assist with those queries. Try to give answers as concise as you can, for example: an exact and crisp answer with within 2-4 lines. Make sure to first check whether they are factually correct or not. Lastly, Never Ever give answers outside Web3 technologies and Web3 domain.' },
            { role: 'user', content: `The user asks: ${userInput}.` },
          ],
        }),
      });

      const data = await response.json();
      chatBox.innerHTML += `<p style="text-align:left;"><img src="/icons/main.png" alt="mainImage" style="height: 14px;" /> ${data.choices[0].message.content}</p>`;
    } catch (error) {
      chatBox.innerHTML += '<p><strong>Error:</strong> Unable to fetch the response.</p>';
    }
  }
}

async function summarizePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getPageContent,
      },
      async (results) => {
        const pageContent = results[0].result;
        try {
          const response = await fetch('https://llama.us.gaianet.network/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama',
              messages: [
                { role: 'system', content: 'Summarize the following web page content.' },
                { role: 'user', content: pageContent },
              ],
            }),
          });

          const data = await response.json();
          const chatBox = document.getElementById('chat-box');
          chatBox.innerHTML += `<p style="text-align:left;"><img src="/icons/main.png" alt="mainImage" style="height: 14px;" /> ${data.choices[0].message.content}</p>`;
        } catch (error) {
          chatBox.innerHTML += '<p><strong>Error:</strong> Unable to summarize the page content.</p>';
        }
      }
    );
  });
}

async function askQuestionAboutPage(userInput) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getPageContent,
      },
      async (results) => {
        const pageContent = results[0]?.result || ''; 
        console.log('Page content:', pageContent);

        if (!pageContent) {
          const chatBox = document.getElementById('chat-box');
          chatBox.innerHTML += '<p><strong>Error:</strong> No content found on this page.</p>';
          return;
        }

        try {
          const response = await fetch('https://llama.us.gaianet.network/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama',
              messages: [
                { role: 'system', content: 'Answer the question based on the provided web page content.' },
                { role: 'user', content: `Page content: ${pageContent}. User's question: ${userInput}` },
              ],
            }),
          });

          console.log('API response:', response);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }


          const data = await response.json();
          const chatBox = document.getElementById('chat-box');
          chatBox.innerHTML += `<p style="text-align:left;"><img src="/icons/main.png" alt="mainImage" style="height: 14px;" /> ${data.choices[0].message.content}</p>`;
        } catch (error) {
          chatBox.innerHTML += '<p><strong>Error:</strong> Unable to answer the question based on the page content.</p>';
        }
      }
    );
  });
}

function getPageContent() {
  return document.body.innerText;
}