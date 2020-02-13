/* global describe CodeMirror Wenyan */
// client-side js
// run by the browser each time your view template referencing it is loaded
var UNTITLED = "Untitled";
var ANONYMOUS = "Anonymous";
var PUBLIC = "public";

var getUrl = window.location;
var baseUrl = 'https://wenyan-snippets.glitch.me/'

console.log("hello world :o");

var editor = undefined;
var editorCM = undefined;
var editorId = -1;

var outcell = undefined;
var outdiv = undefined;

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function newPreview(div, snip) {
  div.innerHTML = "";
  div.classList.add("code-cell");
  div.id = "snip-" + snip.id;

  var hdr = document.createElement("div");
  function ellip(str) {
    if (str.length < 15) {
      return str;
    } else {
      return str.slice(0, 12) + "...";
    }
  }
  hdr.innerHTML = `${describeId(snip.id)}&nbsp;&nbsp;<i>${ellip(
    snip.title
  )}</i>&nbsp;&nbsp;<small>by ${ellip(snip.author)}</small>
    <span style="float:right">
    <i class="material-icons icon-btn" id="btn-play" onclick="onPlay(${
    snip.id
    })">play_arrow</i>
    <i class="material-icons icon-btn" id="btn-edit" onclick="onEdit(${
    snip.id
    })">edit</i>
    <i class="material-icons icon-btn" id="btn-fork" onclick="onFork(${
    snip.id
    })">usb</i>
    <i class="material-icons icon-btn" id="btn-link" onclick="onLink(${
    snip.id
    })">link</i>
    </span>
  `;

  hdr.classList.add("code-header");
  div.appendChild(hdr);

  var cm = document.createElement("pre");
  cm.classList.add("cm-s-wenyan-light");
  cm.classList.add("code-cell-inner");
  div.appendChild(cm);
  CodeMirror.runMode(snip.code, "wenyan", cm);

  var ftr = document.createElement("div");
  ftr.innerHTML = `
    <i class="material-icons icon-icon">star</i>
    ${snip.votes || 0}
    <b class="icon-btn" id="btn-upvote"   onclick="onVote(${
    snip.id
    },+1);"><small><small>+1</small></small></b>
    <b class="icon-btn" id="btn-downvote" onclick="onVote(${
    snip.id
    },-1);"><small><small>-1</small></small></b>
    <span style="float:right; transform:translate(0,6px);"><small>${
    snip.token
      ? snip.token.toUpperCase()
      : "<i class='material-icons icon-icon' style='font-size:13px;transform:translate(0,2px)'>lock</i>"
    }</small></span>
  `;
  ftr.classList.add("code-footer");
  // ftr.style.textAlign = "right"
  div.appendChild(ftr);

  return cm;
}

function log2div() {
  if (arguments[0] instanceof Array && arguments.length == 1) {
    var l = [];
    for (var i = 0; i < arguments[0].length; i++) {
      if (i != 0) {
        l.push("。");
      }
      l.push(arguments[0][i]);
    }
    return log2div(...l);
  }
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] == "number") {
      outdiv.innerText += Wenyan.num2hanzi(arguments[i]);
    } else {
      outdiv.innerText += arguments[i];
    }
  }
  outdiv.innerText += "\n";
}

function onPlay(id) {
  outcell.style.display = "block";
  function run(code) {
    Wenyan.execute(code, {
      errorCallback: log2div,
      output: (...args) => log2div(args.join(" "))
    });
  }
  outdiv.innerText = "";
  if (id + "" == "-1") {
    run(editorCM.getValue());
  } else {
    fetch(`${baseUrl}/one`, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        run(response.code);
      });
  }
}

function onEdit(id) {
  fetch(`${baseUrl}/one`, {
    method: "POST",
    body: JSON.stringify({ id }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      openEditor(response);
    });
}

function onFork(id) {
  fetch(`${baseUrl}/one`, {
    method: "POST",
    body: JSON.stringify({ id }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      response.id = -1;
      response.title += "-remix";
      response.author = ANONYMOUS;
      openEditor(response);
    });
}

function onLink(id) {
  prompt(
    "Embed the snippet using this URL:",
    `<script src="${baseUrl}api?id=${id}" type="application/wenyan"></script>`
  );
}

var didUpvote = {};
var didDownvote = {};
function onVote(id, inc) {
  if (inc > 0) {
    if (didUpvote[id]) {
      return;
    }
    didDownvote[id] = 0;
    didUpvote[id] = 1;
  } else if (inc < 0) {
    if (didDownvote[id]) {
      return;
    }
    didUpvote[id] = 0;
    didDownvote[id] = 1;
  }
  fetch(`${baseUrl}/vote`, {
    method: "POST",
    body: JSON.stringify({ id, increment: inc }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      dispSnippet(response);
    });
}

function describeId(id) {
  if (id + "" == "-1") {
    return "New File";
  } else {
    return "#" + id;
  }
}

function newEditor(snip) {
  var div = document.createElement("div");
  div.classList.add("code-cell");
  div.id = "editor";
  document.body.appendChild(div);

  var hdr = document.createElement("div");
  hdr.innerHTML = `
    <span id="editor-id">${describeId(snip.id)}</span>
    <input id="inp-title" value="${snip.title}" maxlength="32"/> by 
    <input id="inp-author" value="${snip.author}" maxlength="32"/>
    <span style="white-space:nowrap">token&nbsp;<input id="inp-token" value="${
    snip.token
    }" size="40" maxlength="64"/></span>
    <i class="material-icons icon-btn" onclick="document.getElementById('inp-token').value=uuidv4()" style="transform:translate(0,4px)">shuffle</i>
    <span style="float:right;transform:translate(0,3px)">
    <i class="material-icons icon-btn" id="btn-play" onclick="onPlay(-1)">play_arrow</i>
    <i class="material-icons icon-btn" id="btn-submit" onclick="submitSnippet()">publish</i>
    <i class="material-icons icon-btn" id="btn-close" onclick="editor.style.display='none'">close</i>
    </span>
  `;

  hdr.classList.add("code-header");
  div.appendChild(hdr);

  editor = div;
  editorCM = CodeMirror(div, {
    value: snip.code,
    mode: "wenyan",
    lineNumbers: true,
    theme: "wenyan-light",
    styleActiveLine: true
  });

  editorCM.setSize(null, "100%");
}
function openEditor(snip) {
  if (!snip) {
    snip = {
      id: -1,
      title: UNTITLED,
      author: ANONYMOUS,
      code: "注曰「「文言備矣。」」"
    };
  }
  if (!snip.token) {
    snip.token = PUBLIC;
  }
  editorId = snip.id;
  if (!editor) {
    return newEditor(snip);
  }

  editor.style.display = "block";
  editorCM.setValue(snip.code);
  document.getElementById("inp-title").value = snip.title;
  document.getElementById("inp-author").value = snip.author;
  document.getElementById("editor-id").innerText = describeId(snip.id);
}
// newEditor();

function newOutdiv() {
  var div = document.createElement("div");
  div.classList.add("code-cell");

  document.body.appendChild(div);

  var hdr = document.createElement("div");
  hdr.innerHTML = `
    Output
    <span style="float:right">
    <i class="material-icons icon-btn" id="btn-close" onclick="outcell.style.display='none'">close</i>
    </span>
  `;

  hdr.classList.add("code-header");
  div.appendChild(hdr);

  var div2 = document.createElement("div");
  div.appendChild(div2);

  div.id = "out-cell";
  div2.id = "out";

  outcell = div;
  outdiv = div2;
  outcell.style.display = "none";
}
newOutdiv();

// request the dreams from our app's sqlite database
function fetchAll() {
  fetch(`${baseUrl}/all`, {})
    .then(res => res.json())
    .then(response => {
      response.forEach(row => {
        // console.log(row)
        dispSnippet(row);
      });
    });
}
fetchAll();

// a helper function that creates a list item for a given dream
function submitSnippet() {
  var snip = {
    id: editorId,
    token: document.getElementById("inp-token").value,
    code: editorCM.getValue(),
    author: document.getElementById("inp-author").value,
    title: document.getElementById("inp-title").value
  };

  var cmd = Number(snip.id) == -1 ? "/submit" : "/edit";
  console.log(cmd, snip);

  fetch(`${baseUrl}/${cmd}`, {
    method: "POST",
    body: JSON.stringify(snip),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      if (response.message == "badauth") {
        alert(
          "[UNAUTHORIZED] You token does not grant write access to this snippet. Please consider forking."
        );
      } else if (response.message == "success") {
        fetchAll();
        alert("[SUCCESS] Your snippet is now published!");
        onEdit(response.id);
      }
    });
}

const dispSnippet = snip => {
  var div = document.getElementById("snip-" + snip.id);
  if (!div) {
    div = document.createElement("div");
    document.getElementById("content").appendChild(div);
  }
  newPreview(div, snip);
};

document.getElementById("btn-new").onclick = function () {
  openEditor();
};

document.getElementById("search").onkeypress = function (k) {
  if (k.key == "Enter") {
    document.getElementById("btn-search").click();
  }
};

document.getElementById("btn-search").onclick = function () {
  var term = document.getElementById("search").value;
  document.getElementById("content").innerHTML = "";
  if (term[0] == "#") {
    fetch(`${baseUrl}/one`, {
      method: "POST",
      body: JSON.stringify({ id: term.slice(1) }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        dispSnippet(response);
      });
  } else if (term.startsWith("by:")) {
    fetch(`${baseUrl}/author`, {
      method: "POST",
      body: JSON.stringify({ author: term.slice(3) }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        response.forEach(row => {
          dispSnippet(row);
        });
      });
  } else {
    fetch(`${baseUrl}/search`, {
      method: "POST",
      body: JSON.stringify({ keywords: term.split(" ") }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        response.forEach(row => {
          dispSnippet(row);
        });
      });
  }
};
