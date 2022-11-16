<svelte:head>
  <style>
    .github-corner:hover .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }
    .github-corner {
      display: block;
      z-index: 100000;
      cursor: pointer;
      border: 1px solid;
      position: absolute;
      top: 0;
      right: 0;
    }
    @media print {
      .github-corner {
        display: none !important;
      }
    }
    @keyframes octocat-wave {
      0%,
      100% {
        transform: rotate(0);
      }
      20%,
      60% {
        transform: rotate(-25deg);
      }
      40%,
      80% {
        transform: rotate(10deg);
      }
    }
    @media (max-width: 500px) {
      .github-corner:hover .octo-arm {
        animation: none;
      }
      .github-corner .octo-arm {
        animation: octocat-wave 560ms ease-in-out;
      }
    }
  </style>

  <style>
    .coolbutton {
      appearance: none;
      background-color: #fff;
      border: 2px solid #333;
      box-sizing: border-box;
      color: #000;
      cursor: pointer;
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 1em;
      margin: 0;
      opacity: 1;
      outline: 0;
      padding: 1.5em 2.2em;
      position: relative;
      text-align: center;
      text-decoration: none;
      text-rendering: geometricprecision;
      text-transform: uppercase;
      transition: opacity 300ms cubic-bezier(0.694, 0, 0.335, 1),
        background-color 100ms cubic-bezier(0.694, 0, 0.335, 1),
        color 100ms cubic-bezier(0.694, 0, 0.335, 1),
        border-color 500ms cubic-bezier(0.694, 0, 0.335, 1);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      vertical-align: baseline;
      white-space: nowrap;
    }

    .coolbutton:before {
      animation: opacityFallbackOut 0.5s step-end forwards;
      backface-visibility: hidden;
      background-color: #ebebeb;
      clip-path: polygon(-1% 0, 0 0, -25% 100%, -1% 100%);
      content: "";
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      transform: translateZ(0);
      transition: clip-path 0.5s cubic-bezier(0.165, 0.84, 0.44, 1),
        -webkit-clip-path 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      width: 100%;
    }

    .coolbutton:hover:before {
      animation: opacityFallbackIn 0s step-start forwards;
      clip-path: polygon(0 0, 101% 0, 101% 101%, 0 101%);
    }

    .coolbutton:after {
      background-color: #fff;
    }

    .coolbutton span {
      z-index: 1;
      position: relative;
    }

    .coolbutton:hover {
      border-color: transparent;
    }
  </style>
  <style>
    div.chord-diagram {
      overflow: hidden;
      display: inline-block;
    }

    div.chord-diagram > div.header {
      float: left;
      clear: left;
      margin-left: -1px;
    }

    div.chord-diagram > div.header > div {
      position: relative;
      font-family: arial;
      font-size: 13px;
      line-height: 7px;
      text-align: center;
      width: 9px;
      height: 9px;
      float: left;
    }

    div.chord-diagram > div.header > div > div {
      position: absolute;
      top: 0;
      left: 1px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      border: 1px solid #000;
      background: #fff;
    }

    div.chord-diagram > div.row {
      margin-left: 3px;
      float: left;
      clear: both;
    }

    div.chord-diagram > div.row > div {
      position: relative;
      width: 8px;
      height: 9px;
      border: solid #000;
      border-width: 1px 0 0 1px;
      float: left;
    }

    div.chord-diagram > div.row > div:last-child {
      border-width: 1px 1px 0;
    }

    div.chord-diagram > div.header + div:not(.first) {
      margin-top: 3px;
    }

    div.chord-diagram > div.row.first:first-child {
      margin-top: 9px;
    }

    div.chord-diagram > div.row.first > div {
      border-width: 4px 0 0 1px;
    }

    div.chord-diagram > div.row.first > div:last-child {
      border-width: 4px 1px 0;
    }

    div.chord-diagram > div.row.last > div {
      border-width: 1px 0 1px 1px;
    }

    div.chord-diagram > div.row.last > div:last-child {
      border-width: 1px;
    }

    div.chord-diagram > div.row > div > div.barre {
      position: absolute;
      top: 2px;
      left: -3px;
      width: 12px;
      height: 3px;
      border-radius: 2px;
      border: 1px solid #000;
      background: #aaa;
      z-index: 1;
    }

    div.chord-diagram > div.row > div > div.barre.barre-1 {
      width: 12px;
    }

    div.chord-diagram > div.row > div > div.barre.barre-2 {
      width: 21px;
    }

    div.chord-diagram > div.row > div > div.barre.barre-3 {
      width: 30px;
    }

    div.chord-diagram > div.row > div > div.barre.barre-4 {
      width: 39px;
    }

    div.chord-diagram > div.row > div > div.barre.barre-5 {
      width: 48px;
    }

    div.chord-diagram > div.row > div > div.knob {
      position: absolute;
      top: 1px;
      left: -4px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      border: 1px solid #000;
      background: #aaa;
      z-index: 1;
    }

    div.chord-diagram > div.row > div > div.knob.right {
      left: 5px;
    }

    div.chord-diagram > div.row > div.fretno {
      height: 10px;
      width: auto;
      border-width: 0 0 0 1px;
      padding-left: 4px;
      line-height: 12px;
      font-family: arial;
      font-size: 12px;
    }

    div.chord-diagram > div.footer {
      float: left;
      clear: left;
      margin-left: -2px;
    }

    div.chord-diagram > div.footer > div {
      position: relative;
      font-family: arial;
      font-size: 10px;
      text-align: center;
      width: 9px;
      min-height: 11px;
      float: left;
    }
  </style>
  <script>
    var chordDiagram = (function () {
      "use strict";
      var e,
        t = {},
        r = document.createElement("div"),
        n = document.createElement("div"),
        a = document.createElement("div");
      function i(t, r, n) {
        if ("object" != typeof t) return !1;
        for (e = 0; e < r; e += 1)
          if ("number" != typeof t[e] || t[e] % 1 != 0 || t[e] < -1 || t[e] > n)
            return !1;
        return !0;
      }
      return (
        n.appendChild(document.createElement("div")),
        (a.innerHTML = "&times;"),
        (t.build_diagram = function (t, d) {
          var o,
            c,
            l,
            m,
            f,
            u,
            s,
            p,
            h,
            v,
            g,
            b = t.length,
            E = !1,
            C = 100,
            N = 0;
          if (!i(t, b, 32)) throw "Frets parameter format is invalid";
          if (void 0 !== d && !i(d, b, 4))
            throw "Fingers parameter format is invalid";
          for (e = 0; e < b; e += 1)
            t[e] > -1 && t[e] > N && (N = t[e]),
              t[e] > 0 && t[e] < C && (C = t[e]),
              "object" == typeof d && -1 !== d[e] && (E = !0);
          for (
            (o = document.createElement("div")).className = "chord-diagram",
              o.appendChild(
                (function (t) {
                  var i,
                    d = document.createElement("div"),
                    o = t.length;
                  for (d.className = "header", e = 0; e < o; e += 1)
                    (i = 0 === t[e] ? n : -1 === t[e] ? a : r),
                      d.appendChild(i.cloneNode(!0));
                  return d;
                })(t)
              ),
              l = c = N > 5 ? C : 1;
            l < c + 5;
            l += 1
          ) {
            if (
              (((m = document.createElement("div")).className =
                1 === l ? "row first" : l === c + 4 ? "row last" : "row"),
              (s = -1),
              (p = -1),
              (h = -1),
              E)
            ) {
              for (e = 0; e < b; e += 1) {
                if (-1 !== s)
                  if (t[e] === l && d[e] === h) p = e;
                  else if (t[e] < l || (t[e] === l && d[e] !== h)) {
                    if (-1 !== p) break;
                    s = -1;
                  }
                -1 === s && -1 !== d[e] && t[e] === l && ((s = e), (h = d[e]));
              }
              p <= s && (s = -1);
            }
            for (e = 0; e < b - 1; e += 1)
              (f = document.createElement("div")),
                e === s
                  ? (((v = document.createElement("div")).className =
                      "barre barre-" + (p - s)),
                    f.appendChild(v))
                  : (e < s || e >= p) &&
                    (e !== p &&
                      t[e] === l &&
                      (((g = document.createElement("div")).className = "knob"),
                      f.appendChild(g)),
                    e === b - 2 &&
                      t[b - 1] === l &&
                      (((g = document.createElement("div")).className =
                        "knob right"),
                      f.appendChild(g))),
                m.appendChild(f);
            l === c &&
              1 !== l &&
              (((u = document.createElement("div")).className = "fretno"),
              (u.innerHTML = l),
              m.appendChild(u)),
              o.appendChild(m);
          }
          return (
            E &&
              o.appendChild(
                (function (t, r) {
                  var n,
                    a = document.createElement("div"),
                    i = r.length;
                  for (a.className = "footer", e = 0; e < i; e += 1)
                    (n = document.createElement("div")),
                      t[e] > 0 &&
                        (0 === r[e]
                          ? (n.innerHTML = "T")
                          : r[e] > 0 && (n.innerHTML = r[e])),
                      a.appendChild(n);
                  return a;
                })(t, d)
              ),
            o
          );
        }),
        (t.on_load = function () {
          return t.replace_tags();
        }),
        (t.replace_tags = function (r, n, a) {
          void 0 === r && (r = document.body),
            void 0 === n && (n = "chord-diagram"),
            void 0 === a && (a = "div");
          var i,
            d,
            o,
            c,
            l,
            m,
            f,
            u,
            s,
            p,
            h,
            v,
            g = r.getElementsByClassName(n);
          for (d = g.length, i = 0; i < d; i += 1)
            if (
              "object" == typeof (o = g[i]) &&
              (m = o.getAttribute("data-frets"))
            ) {
              for (
                c = +o.getAttribute("data-shift"), f = m.length, l = [], e = 0;
                e < f;
                e += 1
              )
                (u = m.charAt(e).toLowerCase()),
                  (l[e] = "x" === u ? -1 : +u + c);
              if ((p = o.getAttribute("data-fingers")) && f <= p.length) {
                for (s = [], e = 0; e < f; e += 1)
                  (h = p.charAt(e).toLowerCase()), (s[e] = "x" === h ? -1 : +h);
                v = t.build_diagram(l, s);
              } else v = t.build_diagram(l);
              o.innerHTML = v.innerHTML;
            }
        }),
        t
      );
    })();
  </script>
</svelte:head>
