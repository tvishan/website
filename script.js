const THEMES = [
  ["schools", "Preventing violence and promoting mental health in schools"],
  ["communities", "Preventing violence against women in communities"],
  ["feminist", "Advancing feminist practice in violence research and learning"]
];
const THEME_SHORT = {schools: "schools", communities: "communities", feminist: "feminist practice"};
const KINDS = [["paper", "Journal articles"], ["practice", "Learning papers & briefs"], ["talk", "Talks & lectures"]];
const KIND_TAG = {paper: "journal article", practice: "learning paper / brief", talk: "talk / lecture"};
const SELECTED = [
  "Learning by Doing",
  "Religious leaders can motivate men",
  "Regional Resource Persons",
  "Navigating the field of violence prevention",
  "IPV Field Research"
];
const FIELD = [
  {t: "Advisory group member, setting global research priorities on child sexual violence — SVRI, Together for Girls, We Protect Global Alliance and The Brave Movement", years: "2024–2025", links: []},
  {t: "Advisor, Sexual Violence against Children Global Prevalence — Together for Girls", years: "2024–2025", links: [{label: "Report", u: "https://cdn.togetherforgirls.org/assets/files/Break-the-record.pdf"}]},
  {t: "Featured in the SVRI film, How can we end violence against women and children in our lifetime?", years: "2024", links: [{label: "Watch", u: "https://youtu.be/KWin1meQRj0"}]},
  {t: "Invited panellist, Building the new generation of evidence builders — dialogic session, SVRI Forum, South Africa", years: "2024", links: []},
  {t: "Invited panellist, Survivor, activist and practitioner leadership in the knowledge landscape for childhood sexual violence solutions — ISPCAN Congress, Scotland", years: "2023", links: [{label: "Abstract", u: "https://edinburgh2023.exordo.com/programme/presentation/627"}]},
  {t: "Advisory group member, setting global research priorities on violence against women and girls — SVRI and The Equality Institute", years: "2020–2021", links: [{label: "Research agenda", u: "https://www.svri.org/sites/default/files/attachments/2020-09-08/GRA%20Brief%20Draft%20Six.pdf"}]}
];

let writing = [];
let notes = [];
let currentPage = null;
let groupBy = "theme";
let openNoteIndex = null;

function strip(s) {
  return (s || "").replace(/\.\s*$/, "");
}

function decorate(item, sort) {
  var tag = sort === "theme" ? KIND_TAG[item.k] : THEME_SHORT[item.th];
  return {
    t: strip(item.t),
    y: item.y,
    v: strip(item.v),
    u: item.u || "",
    authors: strip(item.a),
    tag: tag
  };
}

function citationHTML(it) {
  var parts = [];
  if (it.authors) parts.push('<span class="cite-meta">' + it.authors + ' </span>');
  parts.push('<span class="cite-meta">(' + it.y + '). </span>');
  if (it.u) {
    parts.push('<a href="' + it.u + '" target="_blank" rel="noopener" class="cite-title-link">' + it.t + '</a>');
  } else {
    parts.push(it.t);
  }
  parts.push('.');
  if (it.v) parts.push(' <em class="cite-venue">' + it.v + '</em>.');
  parts.push(' <span class="cite-tag">' + it.tag + '</span>');
  return '<article class="citation-row"><p>' + parts.join('') + '</p></article>';
}

function renderAbout() {
  var selectedEl = document.getElementById("selected-list");
  selectedEl.innerHTML = SELECTED.map(function(key) {
    var item = writing.find(function(w) { return w.t.includes(key); });
    if (!item) return "";
    return citationHTML(decorate(item, "theme"));
  }).join("");

  var fieldEl = document.getElementById("field-list");
  fieldEl.innerHTML = FIELD.map(function(f) {
    var linksHTML = f.links.map(function(l) {
      return ' <a href="' + l.u + '" target="_blank" rel="noopener" class="field-link">' + l.label + '</a>';
    }).join("");
    return '<li>' + f.t + ' <span class="field-years">(' + f.years + ')</span>' + linksHTML + '</li>';
  }).join("");
}

function renderWriting() {
  document.getElementById("writing-total").textContent = writing.length + " items";

  document.querySelectorAll(".chip").forEach(function(chip) {
    chip.setAttribute("aria-pressed", chip.dataset.sort === groupBy);
  });

  var sorted = writing.slice().sort(function(a, b) { return b.y - a.y; });
  var container = document.getElementById("writing-list");
  container.innerHTML = "";

  var groups;
  if (groupBy === "theme") {
    groups = THEMES.map(function(th) {
      return {
        label: th[1],
        items: sorted.filter(function(w) { return w.th === th[0]; }).map(function(w) { return decorate(w, "theme"); })
      };
    }).filter(function(g) { return g.items.length; });
  } else if (groupBy === "type") {
    groups = KINDS.map(function(k) {
      return {
        label: k[1],
        items: sorted.filter(function(w) { return w.k === k[0]; }).map(function(w) { return decorate(w, "type"); })
      };
    }).filter(function(g) { return g.items.length; });
  } else {
    groups = [{label: "", items: sorted.map(function(w) { return decorate(w, "none"); })}];
  }

  groups.forEach(function(group) {
    var section = document.createElement("section");
    section.className = "writing-group";

    if (group.label) {
      var h2 = document.createElement("h2");
      h2.className = "group-heading";
      h2.textContent = group.label;
      section.appendChild(h2);
    }

    section.innerHTML += group.items.map(citationHTML).join("");
    container.appendChild(section);
  });
}

function renderNotesList() {
  var container = document.getElementById("notes-list");
  container.innerHTML = "";

  var sorted = notes.slice().sort(function(a, b) {
    return (b.iso || "").localeCompare(a.iso || "");
  });

  sorted.forEach(function(note, i) {
    var origIndex = notes.indexOf(note);
    var article = document.createElement("article");
    article.className = "note-entry";
    var html = "";
    if (note.date) html += '<span class="note-date">' + note.date + '</span>';
    html += '<h2 class="note-title">' + note.title + '</h2>';
    if (note.hook) html += '<p class="note-hook">' + note.hook + '</p>';
    if (note.body && note.body.length > 0) {
      html += '<button class="note-action" data-note="' + origIndex + '">Read &rarr;</button>';
    } else {
      html += '<a href="' + note.href + '" target="_blank" rel="noopener" class="note-action">Read on LinkedIn &rarr;</a>';
    }
    article.innerHTML = html;
    container.appendChild(article);
  });

  container.querySelectorAll("button[data-note]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      openNote(parseInt(btn.dataset.note));
    });
  });
}

function openNote(index) {
  openNoteIndex = index;
  var note = notes[index];
  document.getElementById("notes-list-view").style.display = "none";
  var articleView = document.getElementById("note-article-view");
  articleView.style.display = "block";

  var html = '<article class="note-article" style="padding:6px 0 0">';
  html += '<button class="note-back" onclick="closeNote()">&larr; All notes</button>';
  html += '<span class="note-article-date">' + note.date + '</span>';
  html += '<h1>' + note.title + '</h1>';
  html += '<p class="note-article-lede">' + note.hook + '</p>';
  html += '<div class="note-body">';

  note.body.forEach(function(b) {
    if (b.isH) {
      html += '<h2>' + b.text + '</h2>';
    } else if (b.isP) {
      html += '<p>' + b.text + '</p>';
    } else if (b.isList) {
      html += '<ul>';
      b.items.forEach(function(item) {
        html += '<li>';
        if (item.label) html += '<span class="li-label">' + item.label + ' </span>';
        html += item.text + '</li>';
      });
      html += '</ul>';
    } else if (b.isFig) {
      html += '<figure>';
      if (b.img) {
        html += '<img src="' + b.img + '" alt="' + b.text + '" style="width:100%;border:1px solid #ddd6d2">';
      } else {
        html += '<div class="fig-placeholder">image — drop the slide or screenshot here</div>';
      }
      html += '<figcaption>' + b.text + '</figcaption>';
      html += '</figure>';
    }
  });

  html += '</div>';
  html += '<p class="note-footer">Also published on <a href="' + note.href + '" target="_blank" rel="noopener">LinkedIn</a>.</p>';
  html += '</article>';

  articleView.innerHTML = html;
  window.scrollTo({top: 0});
}

function closeNote() {
  openNoteIndex = null;
  document.getElementById("note-article-view").style.display = "none";
  document.getElementById("notes-list-view").style.display = "block";
  window.scrollTo({top: 0});
}

function navigate(page) {
  if (page === currentPage && page !== "notes") return;
  if (page === "notes" && currentPage === "notes" && openNoteIndex !== null) {
    closeNote();
    return;
  }
  currentPage = page;
  openNoteIndex = null;

  document.querySelectorAll(".page").forEach(function(el) { el.classList.remove("active"); });
  document.getElementById("page-" + page).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(function(el) {
    el.setAttribute("aria-current", el.dataset.page === page ? "page" : "false");
  });

  var wordmark = document.getElementById("wordmark");
  wordmark.textContent = page === "home" ? "" : "Tvisha Nevatia";

  window.scrollTo({top: 0});
  history.pushState(null, "", page === "home" ? "/" : "/" + page);

  if (page === "notes") {
    document.getElementById("notes-list-view").style.display = "block";
    document.getElementById("note-article-view").style.display = "none";
    renderNotesList();
  }
  if (page === "writing") renderWriting();
}

function setGroupBy(sort) {
  groupBy = groupBy === sort ? "none" : sort;
  renderWriting();
}

function pageFromPath(path) {
  var clean = path.replace(/^\/|\/$/g, "");
  if (clean === "writing") return "writing";
  if (clean === "notes") return "notes";
  return "home";
}

async function init() {
  var writingRes = await fetch("data/writing.json");
  var notesRes = await fetch("data/notes.json");
  writing = await writingRes.json();
  notes = await notesRes.json();

  renderAbout();
  navigate(pageFromPath(window.location.pathname));

  window.addEventListener("popstate", function() {
    navigate(pageFromPath(window.location.pathname));
  });
}

document.addEventListener("DOMContentLoaded", init);
