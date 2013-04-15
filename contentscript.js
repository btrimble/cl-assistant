var s = document.createElement('cl_assistant.user.js');
s.src = chrome.extension.getURL('cl_assistant.user.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};