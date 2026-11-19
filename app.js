(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var form = $("form"), statusEl = $("status"), btn = $("submit");
  var COOLDOWN_KEY = "hb_last_submit";

  // ---- setup ----
  $("year").textContent = new Date().getFullYear();
  $("maxmb").textContent = C.MAX_CV_MB;
  $("maxchars").textContent = C.MAX_MOTIVATION_CHARS;
  C.POSITIONS.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p.value; o.textContent = p.label;
    $("position").appendChild(o);
  });
  $("motivation").addEventListener("input", function () { $("count").textContent = this.value.length; });

  // ---- helpers ----
  function show(kind, msg) { statusEl.className = "status " + kind; statusEl.textContent = msg; }
  function setErr(field, msg) {
    var el = document.querySelector('.err[data-for="' + field + '"]');
    if (el) el.textContent = msg || "";
    var input = $(field);
    if (input) input.classList.toggle("invalid", !!msg);
  }
  function lastSubmit() { try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch (e) { return 0; } }
  function markSubmit() { try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (e) {} }
  function cooldownLeft() {
    return Math.max(0, Math.ceil((lastSubmit() + C.COOLDOWN_SECONDS * 1000 - Date.now()) / 1000));
  }

  // ---- validation (convenience only: n8n re-validates everything server-side) ----
  function validate() {
    var ok = true;
    ["name", "email", "position", "cv", "motivation"].forEach(function (f) { setErr(f, ""); });

    var name = $("name").value.trim().replace(/\s+/g, " ");
    if (name.length < 3 || name.split(" ").length < 2 || !/^[\p{L} .'-]+$/u.test(name)) {
      setErr("name", "Please enter your full name (first and last name, letters only)."); ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("email").value.trim())) {
      setErr("email", "Please enter a valid email address."); ok = false;
    }
    if (!$("position").value) { setErr("position", "Please choose a position."); ok = false; }

    var file = $("cv").files[0];
    if (!file) { setErr("cv", "Please attach your CV."); ok = false; }
    else if (!/\.pdf$/i.test(file.name)) { setErr("cv", "Your CV must be a PDF file."); ok = false; }
    else if (file.size > C.MAX_CV_MB * 1024 * 1024) { setErr("cv", "Your CV must be smaller than " + C.MAX_CV_MB + " MB."); ok = false; }
    else if (file.size < 500) { setErr("cv", "Your CV file looks empty or damaged."); ok = false; }

    if ($("motivation").value.length > C.MAX_MOTIVATION_CHARS) {
      setErr("motivation", "Please keep this under " + C.MAX_MOTIVATION_CHARS + " characters."); ok = false;
    }
    return ok;
  }

  // ---- submit ----
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    // Honeypot: real people never see this field. Pretend success, send nothing.
    if ($("website").value) { show("ok", "Thank you! Your application was received."); form.reset(); return; }

    var wait = cooldownLeft();
    if (wait > 0) { show("info", "Please wait " + wait + " seconds before submitting again."); return; }

    if (!validate()) { show("bad", "Please fix the highlighted fields."); return; }

    var F = C.FIELDS, fd = new FormData();
    fd.append(F.name, $("name").value.trim().replace(/\s+/g, " "));
    fd.append(F.email, $("email").value.trim());
    fd.append(F.position, $("position").value);
    fd.append(F.cv, $("cv").files[0], $("cv").files[0].name);
    fd.append(F.motivation, $("motivation").value.trim());

    btn.disabled = true; btn.textContent = "Submitting...";
    show("info", "Uploading your application. Please keep this page open.");

    fetch(C.N8N_BASE_URL.replace(/\/+$/, "") + C.FORM_PATH, {
      method: "POST",
      body: fd,
      headers: { "ngrok-skip-browser-warning": "true" }
    }).then(function (res) {
      if (res.ok) {
        markSubmit();
        show("ok", "Thank you! Your application was received. Our team will review it and contact you by email.");
        form.reset(); $("count").textContent = "0";
      } else {
        show("bad", "We could not accept your application (error " + res.status + "). Please check your details and try again.");
      }
    }).catch(function () {
      // Network error or blocked by CORS: the browser hides the reason.
      show("bad", "We could not reach the application server. Please try again in a few minutes.");
    }).then(function () {
      btn.disabled = false; btn.textContent = "Submit application";
    });
  });
})();
