import * as Popper from "https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js";

// FileUploadWithPreview
const upload = new FileUploadWithPreview.FileUploadWithPreview("upload-image", {
  multiple: true,
  maxFileCount: 6
});
// End FileUploadWithPreview

// CLIENT_SEND_MESSAGE
const formSendData = document.querySelector(".chat .inner-form");
if (formSendData) {
  formSendData.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.elements.content.value;
    const images = upload.cachedFileArray || [];

    if (content || images.length > 0) {
      // Gửi content hoặc ảnh lên server      
      socket.emit("CLIENT_SEND_MESSAGE", {
        content: content,
        images: images
      });
      e.target.elements.content.value = "";
      upload.resetPreviewPanel();
      socket.emit("CLIENT_SEND_TYPING", "hidden");
    }
  });
}
// End CLIENT_SEND_MESSAGE

// SERVER_RETURN_MESSAGE
socket.on("SERVER_RETURN_MESSAGE", (data) => {
  const myId = document.querySelector("[my-id]").getAttribute("my-id");
  const body = document.querySelector(".chat .inner-body");
  const boxTyping = document.querySelector(".inner-list-typing");

  const div = document.createElement("div");

  let htmlFullName = "";
  let htmlContent = "";
  let htmlImages = "";

  if (myId == data.userId) {
    div.classList.add("inner-outgoing");
  } else {
    div.classList.add("inner-incoming");
    htmlFullName = `<div class="inner-name">${data.fullName}</div>`;
  }

  if(data.content) {
    htmlContent = `
      <div class="inner-content">${data.content}</div>
    `;
  }

  if(data.images) {
    htmlImages += `<div class="inner-images">`;

    for (const image of data.images) {
      htmlImages += `
        <img src="${image}">
      `;
    }

    htmlImages += `</div>`;
  }

  div.innerHTML = `
    ${htmlFullName}
    ${htmlContent}
    ${htmlImages}
  `;

  body.insertBefore(div, boxTyping);

  body.scrollTop = body.scrollHeight;

  // Preview Image
  const boxImages = div.querySelector(".inner-images");
  if(boxImages) {
    const gallery = new Viewer(boxImages);
  }
});
// End SERVER_RETURN_MESSAGE

// Scroll Chat To Bottom
const bodyChat = document.querySelector(".chat .inner-body");
if (bodyChat) {
  bodyChat.scrollTop = bodyChat.scrollHeight;
}
// End Scroll Chat To Bottom

// Show Typing
var timeOut;
const showTyping = () => {
  socket.emit("CLIENT_SEND_TYPING", "show");

  clearTimeout(timeOut);

  timeOut = setTimeout(() => {
    socket.emit("CLIENT_SEND_TYPING", "hidden");
  }, 3000);
};
// End Show Typing

// emoji-picker
// Show Popup
const buttonIcon = document.querySelector(".button-icon");
if (buttonIcon) {
  const tooltip = document.querySelector(".tooltip");
  Popper.createPopper(buttonIcon, tooltip);

  buttonIcon.onclick = () => {
    tooltip.classList.toggle("shown");
  };
}

// Insert Icon To Input

const emojiPicker = document.querySelector("emoji-picker");
if (emojiPicker) {
  const inputChat = document.querySelector(
    ".chat .inner-form input[name='content']"
  );

  emojiPicker.addEventListener("emoji-click", (event) => {
    const icon = event.detail.unicode;
    inputChat.value = inputChat.value + icon;

    const end = inputChat.value.length;
    inputChat.setSelectionRange(end, end);
    inputChat.focus();

    showTyping();
  });

  inputChat.addEventListener("keyup", () => {
    showTyping();
  });
}
// End emoji-picker

// SERVER_RETURN_TYPING
const elementListTyping = document.querySelector(".chat .inner-list-typing");
if (elementListTyping) {
  socket.on("SERVER_RETURN_TYPING", (data) => {
    if (data.type == "show") {
      const existTyping = elementListTyping.querySelector(
        `[user-id="${data.userId}"]`
      );

      if (!existTyping) {
        const bodyChat = document.querySelector(".chat .inner-body");
        const boxTyping = document.createElement("div");
        boxTyping.classList.add("box-typing");
        boxTyping.setAttribute("user-id", data.userId);

        boxTyping.innerHTML = `
          <div class="inner-name">${data.fullName}</div>
          <div class="inner-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        `;

        elementListTyping.appendChild(boxTyping);
        bodyChat.scrollTop = bodyChat.scrollHeight;
      }
    } else {
      const boxTypingRemove = elementListTyping.querySelector(
        `[user-id="${data.userId}"]`
      );

      if (boxTypingRemove) {
        elementListTyping.removeChild(boxTypingRemove);
      }
    }
  });
}
// End SERVER_RETURN_TYPING

// Preview Image
const chatBody = document.querySelector(".chat .inner-body");

if(chatBody) {
  const gallery = new Viewer(chatBody);
}
// End Preview Image