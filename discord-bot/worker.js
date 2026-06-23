var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/util.js
var require_util = __commonJS({
  "node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.concatUint8Arrays = exports.valueToUint8Array = exports.subtleCrypto = void 0;
    function getSubtleCrypto() {
      if (typeof window !== "undefined" && window.crypto) {
        return window.crypto.subtle;
      }
      if (typeof globalThis !== "undefined" && globalThis.crypto) {
        return globalThis.crypto.subtle;
      }
      if (typeof crypto !== "undefined") {
        return crypto.subtle;
      }
      if (typeof __require === "function") {
        const cryptoPackage = "node:crypto";
        const crypto2 = __require(cryptoPackage);
        return crypto2.webcrypto.subtle;
      }
      throw new Error("No Web Crypto API implementation found");
    }
    __name(getSubtleCrypto, "getSubtleCrypto");
    exports.subtleCrypto = getSubtleCrypto();
    function valueToUint8Array(value, format) {
      if (value == null) {
        return new Uint8Array();
      }
      if (typeof value === "string") {
        if (format === "hex") {
          const matches = value.match(/.{1,2}/g);
          if (matches == null) {
            throw new Error("Value is not a valid hex string");
          }
          const hexVal = matches.map((byte) => Number.parseInt(byte, 16));
          return new Uint8Array(hexVal);
        }
        return new TextEncoder().encode(value);
      }
      try {
        if (Buffer.isBuffer(value)) {
          return new Uint8Array(value);
        }
      } catch (_ex) {
      }
      if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
      }
      if (value instanceof Uint8Array) {
        return value;
      }
      throw new Error("Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array");
    }
    __name(valueToUint8Array, "valueToUint8Array");
    exports.valueToUint8Array = valueToUint8Array;
    function concatUint8Arrays(arr1, arr2) {
      const merged = new Uint8Array(arr1.length + arr2.length);
      merged.set(arr1);
      merged.set(arr2, arr1.length);
      return merged;
    }
    __name(concatUint8Arrays, "concatUint8Arrays");
    exports.concatUint8Arrays = concatUint8Arrays;
  }
});

// node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/webhooks.js
var require_webhooks = __commonJS({
  "node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/webhooks.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebhookEventType = exports.WebhookType = void 0;
    var WebhookType;
    (function(WebhookType2) {
      WebhookType2[WebhookType2["PING"] = 0] = "PING";
      WebhookType2[WebhookType2["EVENT"] = 1] = "EVENT";
    })(WebhookType || (exports.WebhookType = WebhookType = {}));
    var WebhookEventType;
    (function(WebhookEventType2) {
      WebhookEventType2["APPLICATION_AUTHORIZED"] = "APPLICATION_AUTHORIZED";
      WebhookEventType2["APPLICATION_DEAUTHORIZED"] = "APPLICATION_DEAUTHORIZED";
      WebhookEventType2["ENTITLEMENT_CREATE"] = "ENTITLEMENT_CREATE";
      WebhookEventType2["QUEST_USER_ENROLLMENT"] = "QUEST_USER_ENROLLMENT";
      WebhookEventType2["LOBBY_MESSAGE_CREATE"] = "LOBBY_MESSAGE_CREATE";
      WebhookEventType2["LOBBY_MESSAGE_UPDATE"] = "LOBBY_MESSAGE_UPDATE";
      WebhookEventType2["LOBBY_MESSAGE_DELETE"] = "LOBBY_MESSAGE_DELETE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_CREATE"] = "GAME_DIRECT_MESSAGE_CREATE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_UPDATE"] = "GAME_DIRECT_MESSAGE_UPDATE";
      WebhookEventType2["GAME_DIRECT_MESSAGE_DELETE"] = "GAME_DIRECT_MESSAGE_DELETE";
    })(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
  }
});

// node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/components.js
var require_components = __commonJS({
  "node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/components.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SeparatorSpacingTypes = exports.TextStyleTypes = exports.ChannelTypes = exports.ButtonStyleTypes = exports.MessageComponentTypes = void 0;
    var MessageComponentTypes;
    (function(MessageComponentTypes2) {
      MessageComponentTypes2[MessageComponentTypes2["ACTION_ROW"] = 1] = "ACTION_ROW";
      MessageComponentTypes2[MessageComponentTypes2["BUTTON"] = 2] = "BUTTON";
      MessageComponentTypes2[MessageComponentTypes2["STRING_SELECT"] = 3] = "STRING_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["INPUT_TEXT"] = 4] = "INPUT_TEXT";
      MessageComponentTypes2[MessageComponentTypes2["USER_SELECT"] = 5] = "USER_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["ROLE_SELECT"] = 6] = "ROLE_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["MENTIONABLE_SELECT"] = 7] = "MENTIONABLE_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["CHANNEL_SELECT"] = 8] = "CHANNEL_SELECT";
      MessageComponentTypes2[MessageComponentTypes2["SECTION"] = 9] = "SECTION";
      MessageComponentTypes2[MessageComponentTypes2["TEXT_DISPLAY"] = 10] = "TEXT_DISPLAY";
      MessageComponentTypes2[MessageComponentTypes2["THUMBNAIL"] = 11] = "THUMBNAIL";
      MessageComponentTypes2[MessageComponentTypes2["MEDIA_GALLERY"] = 12] = "MEDIA_GALLERY";
      MessageComponentTypes2[MessageComponentTypes2["FILE"] = 13] = "FILE";
      MessageComponentTypes2[MessageComponentTypes2["SEPARATOR"] = 14] = "SEPARATOR";
      MessageComponentTypes2[MessageComponentTypes2["CONTAINER"] = 17] = "CONTAINER";
      MessageComponentTypes2[MessageComponentTypes2["LABEL"] = 18] = "LABEL";
    })(MessageComponentTypes || (exports.MessageComponentTypes = MessageComponentTypes = {}));
    var ButtonStyleTypes;
    (function(ButtonStyleTypes2) {
      ButtonStyleTypes2[ButtonStyleTypes2["PRIMARY"] = 1] = "PRIMARY";
      ButtonStyleTypes2[ButtonStyleTypes2["SECONDARY"] = 2] = "SECONDARY";
      ButtonStyleTypes2[ButtonStyleTypes2["SUCCESS"] = 3] = "SUCCESS";
      ButtonStyleTypes2[ButtonStyleTypes2["DANGER"] = 4] = "DANGER";
      ButtonStyleTypes2[ButtonStyleTypes2["LINK"] = 5] = "LINK";
      ButtonStyleTypes2[ButtonStyleTypes2["PREMIUM"] = 6] = "PREMIUM";
    })(ButtonStyleTypes || (exports.ButtonStyleTypes = ButtonStyleTypes = {}));
    var ChannelTypes;
    (function(ChannelTypes2) {
      ChannelTypes2[ChannelTypes2["GUILD_TEXT"] = 0] = "GUILD_TEXT";
      ChannelTypes2[ChannelTypes2["DM"] = 1] = "DM";
      ChannelTypes2[ChannelTypes2["GUILD_VOICE"] = 2] = "GUILD_VOICE";
      ChannelTypes2[ChannelTypes2["GROUP_DM"] = 3] = "GROUP_DM";
      ChannelTypes2[ChannelTypes2["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
      ChannelTypes2[ChannelTypes2["GUILD_ANNOUNCEMENT"] = 5] = "GUILD_ANNOUNCEMENT";
      ChannelTypes2[ChannelTypes2["GUILD_STORE"] = 6] = "GUILD_STORE";
      ChannelTypes2[ChannelTypes2["ANNOUNCEMENT_THREAD"] = 10] = "ANNOUNCEMENT_THREAD";
      ChannelTypes2[ChannelTypes2["PUBLIC_THREAD"] = 11] = "PUBLIC_THREAD";
      ChannelTypes2[ChannelTypes2["PRIVATE_THREAD"] = 12] = "PRIVATE_THREAD";
      ChannelTypes2[ChannelTypes2["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
      ChannelTypes2[ChannelTypes2["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
      ChannelTypes2[ChannelTypes2["GUILD_FORUM"] = 15] = "GUILD_FORUM";
      ChannelTypes2[ChannelTypes2["GUILD_MEDIA"] = 16] = "GUILD_MEDIA";
    })(ChannelTypes || (exports.ChannelTypes = ChannelTypes = {}));
    var TextStyleTypes;
    (function(TextStyleTypes2) {
      TextStyleTypes2[TextStyleTypes2["SHORT"] = 1] = "SHORT";
      TextStyleTypes2[TextStyleTypes2["PARAGRAPH"] = 2] = "PARAGRAPH";
    })(TextStyleTypes || (exports.TextStyleTypes = TextStyleTypes = {}));
    var SeparatorSpacingTypes;
    (function(SeparatorSpacingTypes2) {
      SeparatorSpacingTypes2[SeparatorSpacingTypes2["SMALL"] = 1] = "SMALL";
      SeparatorSpacingTypes2[SeparatorSpacingTypes2["LARGE"] = 2] = "LARGE";
    })(SeparatorSpacingTypes || (exports.SeparatorSpacingTypes = SeparatorSpacingTypes = {}));
  }
});

// node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/discord-interactions@4.4.0/node_modules/discord-interactions/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyWebhookEventMiddleware = exports.verifyKeyMiddleware = exports.verifyKey = exports.InteractionResponseFlags = exports.InteractionResponseType = exports.InteractionType = void 0;
    var util_1 = require_util();
    var webhooks_1 = require_webhooks();
    var InteractionType2;
    (function(InteractionType3) {
      InteractionType3[InteractionType3["PING"] = 1] = "PING";
      InteractionType3[InteractionType3["APPLICATION_COMMAND"] = 2] = "APPLICATION_COMMAND";
      InteractionType3[InteractionType3["MESSAGE_COMPONENT"] = 3] = "MESSAGE_COMPONENT";
      InteractionType3[InteractionType3["APPLICATION_COMMAND_AUTOCOMPLETE"] = 4] = "APPLICATION_COMMAND_AUTOCOMPLETE";
      InteractionType3[InteractionType3["MODAL_SUBMIT"] = 5] = "MODAL_SUBMIT";
    })(InteractionType2 || (exports.InteractionType = InteractionType2 = {}));
    var InteractionResponseType2;
    (function(InteractionResponseType3) {
      InteractionResponseType3[InteractionResponseType3["PONG"] = 1] = "PONG";
      InteractionResponseType3[InteractionResponseType3["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
      InteractionResponseType3[InteractionResponseType3["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
      InteractionResponseType3[InteractionResponseType3["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
      InteractionResponseType3[InteractionResponseType3["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
      InteractionResponseType3[InteractionResponseType3["APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
      InteractionResponseType3[InteractionResponseType3["MODAL"] = 9] = "MODAL";
      InteractionResponseType3[InteractionResponseType3["PREMIUM_REQUIRED"] = 10] = "PREMIUM_REQUIRED";
      InteractionResponseType3[InteractionResponseType3["LAUNCH_ACTIVITY"] = 12] = "LAUNCH_ACTIVITY";
    })(InteractionResponseType2 || (exports.InteractionResponseType = InteractionResponseType2 = {}));
    var InteractionResponseFlags;
    (function(InteractionResponseFlags2) {
      InteractionResponseFlags2[InteractionResponseFlags2["EPHEMERAL"] = 64] = "EPHEMERAL";
      InteractionResponseFlags2[InteractionResponseFlags2["IS_COMPONENTS_V2"] = 32768] = "IS_COMPONENTS_V2";
    })(InteractionResponseFlags || (exports.InteractionResponseFlags = InteractionResponseFlags = {}));
    function verifyKey2(rawBody, signature, timestamp, clientPublicKey) {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const timestampData = (0, util_1.valueToUint8Array)(timestamp);
          const bodyData = (0, util_1.valueToUint8Array)(rawBody);
          const message = (0, util_1.concatUint8Arrays)(timestampData, bodyData);
          const publicKey = typeof clientPublicKey === "string" ? yield util_1.subtleCrypto.importKey("raw", (0, util_1.valueToUint8Array)(clientPublicKey, "hex"), {
            name: "ed25519",
            namedCurve: "ed25519"
          }, false, ["verify"]) : clientPublicKey;
          const isValid = yield util_1.subtleCrypto.verify({
            name: "ed25519"
          }, publicKey, (0, util_1.valueToUint8Array)(signature, "hex"), message);
          return isValid;
        } catch (_ex) {
          return false;
        }
      });
    }
    __name(verifyKey2, "verifyKey");
    exports.verifyKey = verifyKey2;
    function verifyKeyMiddleware(clientPublicKey) {
      if (!clientPublicKey) {
        throw new Error("You must specify a Discord client public key");
      }
      return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const timestamp = req.header("X-Signature-Timestamp") || "";
        const signature = req.header("X-Signature-Ed25519") || "";
        if (!timestamp || !signature) {
          res.statusCode = 401;
          res.end("[discord-interactions] Invalid signature");
          return;
        }
        function onBodyComplete(rawBody) {
          return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield verifyKey2(rawBody, signature, timestamp, clientPublicKey);
            if (!isValid) {
              res.statusCode = 401;
              res.end("[discord-interactions] Invalid signature");
              return;
            }
            const body = JSON.parse(rawBody.toString("utf-8")) || {};
            if (body.type === InteractionType2.PING) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                type: InteractionResponseType2.PONG
              }));
              return;
            }
            req.body = body;
            next();
          });
        }
        __name(onBodyComplete, "onBodyComplete");
        if (req.body) {
          if (Buffer.isBuffer(req.body)) {
            yield onBodyComplete(req.body);
          } else if (typeof req.body === "string") {
            yield onBodyComplete(Buffer.from(req.body, "utf-8"));
          } else {
            console.warn("[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.");
            yield onBodyComplete(Buffer.from(JSON.stringify(req.body), "utf-8"));
          }
        } else {
          const chunks = [];
          req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          req.on("end", () => __awaiter(this, void 0, void 0, function* () {
            const rawBody = Buffer.concat(chunks);
            yield onBodyComplete(rawBody);
          }));
        }
      });
    }
    __name(verifyKeyMiddleware, "verifyKeyMiddleware");
    exports.verifyKeyMiddleware = verifyKeyMiddleware;
    function verifyWebhookEventMiddleware(clientPublicKey) {
      if (!clientPublicKey) {
        throw new Error("You must specify a Discord client public key");
      }
      return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const timestamp = req.header("X-Signature-Timestamp") || "";
        const signature = req.header("X-Signature-Ed25519") || "";
        if (!timestamp || !signature) {
          res.statusCode = 401;
          res.end("[discord-interactions] Invalid signature");
          return;
        }
        function onBodyComplete(rawBody) {
          return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield verifyKey2(rawBody, signature, timestamp, clientPublicKey);
            if (!isValid) {
              res.statusCode = 401;
              res.end("[discord-interactions] Invalid signature");
              return;
            }
            const body = JSON.parse(rawBody.toString("utf-8")) || {};
            if (body.type === webhooks_1.WebhookType.PING) {
              res.statusCode = 204;
              res.end();
              return;
            }
            req.body = body;
            res.statusCode = 204;
            res.end();
            next();
          });
        }
        __name(onBodyComplete, "onBodyComplete");
        if (req.body) {
          if (Buffer.isBuffer(req.body)) {
            yield onBodyComplete(req.body);
          } else if (typeof req.body === "string") {
            yield onBodyComplete(Buffer.from(req.body, "utf-8"));
          } else {
            console.warn("[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for webhook event routes so that req.body is a raw buffer.");
            yield onBodyComplete(Buffer.from(JSON.stringify(req.body), "utf-8"));
          }
        } else {
          const chunks = [];
          req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          req.on("end", () => __awaiter(this, void 0, void 0, function* () {
            const rawBody = Buffer.concat(chunks);
            yield onBodyComplete(rawBody);
          }));
        }
      });
    }
    __name(verifyWebhookEventMiddleware, "verifyWebhookEventMiddleware");
    exports.verifyWebhookEventMiddleware = verifyWebhookEventMiddleware;
    __exportStar(require_components(), exports);
    __exportStar(require_webhooks(), exports);
  }
});

// src/index.js
var import_discord_interactions = __toESM(require_dist(), 1);
var API = "https://discord.com/api/v10";
var VIEW_CHANNEL = "1024";
var SEND_MESSAGES = "2048";
var READ_MESSAGE_HISTORY = "65536";
var CHANNEL_ALLOW = String(Number(VIEW_CHANNEL) + Number(SEND_MESSAGES) + Number(READ_MESSAGE_HISTORY));
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json;charset=UTF-8" }
  });
}
__name(json, "json");
function corsJson(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "access-control-allow-origin": new URL(env.SITE_URL).origin,
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
      "cache-control": "no-store"
    }
  });
}
__name(corsJson, "corsJson");
function accessDenied() {
  return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acces reserve</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050b16;color:#eef3fb;font-family:Arial,sans-serif}.box{max-width:520px;padding:32px;text-align:center}h1{font-size:28px}p{color:#aab7ca;line-height:1.6}a{display:inline-block;margin-top:14px;padding:13px 18px;background:#d98a00;color:#111;text-decoration:none;font-weight:700;border-radius:6px}</style><div class="box"><h1>Acces reserve aux candidats</h1><p>Ouvre un ticket de recrutement sur Discord pour recevoir ton lien personnel vers le questionnaire.</p><a href="https://discord.gg/KsSmxnNKWV">Ouvrir Discord</a></div></html>`, {
    status: 403,
    headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }
  });
}
__name(accessDenied, "accessDenied");
async function discord(env, path, init = {}) {
  const response = await fetch(API + path, {
    ...init,
    headers: {
      authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      "content-type": "application/json",
      ...init.headers || {}
    }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Discord ${response.status}: ${message}`);
  }
  if (response.status === 204) return null;
  return response.json();
}
__name(discord, "discord");
async function getTicketAccess(env, token) {
  if (!token) return null;
  return env.TICKET_ACCESS.get(`token:${token}`, "json");
}
__name(getTicketAccess, "getTicketAccess");
async function serveRecruitment(env, url) {
  const token = url.searchParams.get("token");
  const access = await getTicketAccess(env, token);
  if (!access) return accessDenied();
  const upstream = await fetch(`${env.SITE_URL}/recrutement.html`, {
    headers: { "cache-control": "no-cache" }
  });
  let html = await upstream.text();
  const apiUrl = `${url.origin}/api?token=${encodeURIComponent(token)}`;
  html = html.replace("<head>", `<head>
<base href="${env.SITE_URL}/"><style>.site-header{display:none!important}body{padding-top:0!important}</style>`).replace('<script src="config.js"><\/script>', `<script>window.SASP_API_URL=${JSON.stringify(apiUrl)};<\/script>`);
  return new Response(html, {
    headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }
  });
}
__name(serveRecruitment, "serveRecruitment");
async function sendQcmRecap(env, access, payload, applicationId) {
  const answers = payload.qcm || {};
  const open = payload.openQuestions || {};
  const sits = payload.situations || {};
  const scores = payload.scores || {};
  const qcmFields = ["q1", "q2", "q3", "q4", "q5", "q6"].map((key, i) => ({
    name: `Q${i + 1} — QCM`,
    value: String(answers[key] || "Aucune r\xE9ponse").slice(0, 1024),
    inline: false
  }));
  const openLabels = {
    qualites: "Qualit\xE9s", defauts: "D\xE9fauts", pourquoiBCSO: "Pourquoi le BCSO ?",
    rpPourVous: "Le RP pour vous", descriptionMetier: "M\xE9tier d'agent BCSO",
    gradeVise: "Grade vis\xE9", reactionCritique: "R\xE9action face \xE0 la critique",
    passionsHRP: "Passions HRP", animal: "Si vous \xE9tiez un animal", pourquoiVous: "Pourquoi vous ?"
  };
  const openFields = Object.entries(openLabels).map(([key, label]) => ({
    name: label,
    value: String(open[key] || "—").slice(0, 1024),
    inline: false
  }));
  const sitFields = [
    { key: "situation1", label: "Situation 1 — Poursuite" },
    { key: "situation2", label: "Situation 2 — Interpellation" },
    { key: "situation3", label: "Situation 3 — Dilemme \xE9thique" }
  ].map(({ key, label }) => ({
    name: label,
    value: String(sits[key] || "—").slice(0, 1024),
    inline: false
  }));
  const baseDesc = `**Candidat :** ${String(payload.prenomRP || "")} ${String(payload.nomRP || "")}\n**Score global :** ${scores.global ?? "-"} / 100\n**R\xE9f\xE9rence :** #${applicationId}`;
  const allFields = [...qcmFields, ...openFields, ...sitFields];
  const embeds = [];
  let chunk = [];
  let charCount = baseDesc.length;
  for (const f of allFields) {
    const fLen = f.name.length + f.value.length;
    if (chunk.length === 25 || charCount + fLen > 5800) {
      embeds.push({ fields: chunk, color: 14260786 });
      chunk = [];
      charCount = 0;
    }
    chunk.push(f);
    charCount += fLen;
  }
  if (chunk.length) embeds.push({ fields: chunk, color: 14260786 });
  embeds[0].title = "QCM termin\xE9 — R\xE9capitulatif";
  embeds[0].description = baseDesc;
  embeds[embeds.length - 1].footer = { text: "Le lien du QCM est maintenant d\xE9sactiv\xE9" };
  embeds[embeds.length - 1].timestamp = (/* @__PURE__ */ new Date()).toISOString();
  await discord(env, `/channels/${access.channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `<@${access.userId}> <@&${env.RECRUITMENT_PING_ROLE_ID}>`,
      allowed_mentions: { parse: [], users: [access.userId], roles: [env.RECRUITMENT_PING_ROLE_ID] },
      embeds: embeds.slice(0, 10)
    })
  });
}
__name(sendQcmRecap, "sendQcmRecap");
async function processApplicationSubmission(env, token, access, payload) {
  const encoded = new URLSearchParams();
  encoded.set("payload", JSON.stringify(payload));
  const upstream = await fetch(env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: encoded.toString(),
    redirect: "follow"
  });
  const responseText = await upstream.text();
  let linkedApplicationId = "";
  try {
    const result = JSON.parse(responseText);
    if (result.success && result.id) linkedApplicationId = String(result.id);
  } catch (error) {
    console.error("R\xE9ponse Apps Script non JSON", error);
  }
  if (!linkedApplicationId) {
    const listUrl = new URL(env.APPS_SCRIPT_URL);
    listUrl.searchParams.set("action", "list");
    const listResponse = await fetch(listUrl, { redirect: "follow" });
    const listResult = await listResponse.json();
    const latest = (listResult.data || []).find(
      (application) => String(application.pseudoDiscord || "") === String(payload.pseudoDiscord || "") && String(application.nomRP || "") === String(payload.nomRP || "") && String(application.prenomRP || "") === String(payload.prenomRP || "")
    );
    if (latest?.id) linkedApplicationId = String(latest.id);
  }
  if (!linkedApplicationId) throw new Error("Candidature introuvable apr\xE8s envoi");
  await env.TICKET_ACCESS.put(`application:${linkedApplicationId}`, JSON.stringify(access), { expirationTtl: 90 * 24 * 60 * 60 });
  if (!await env.TICKET_ACCESS.get(`qcm-completed:${access.channelId}`)) {
    await sendQcmRecap(env, access, payload, linkedApplicationId);
    await Promise.all([
      env.TICKET_ACCESS.put(`qcm-completed:${access.channelId}`, linkedApplicationId, { expirationTtl: 90 * 24 * 60 * 60 }),
      env.TICKET_ACCESS.delete(`token:${token}`),
      env.TICKET_ACCESS.delete(`channel:${access.channelId}`)
    ]);
  }
}
__name(processApplicationSubmission, "processApplicationSubmission");
async function proxyAppsScript(request, env, url, ctx) {
  const token = url.searchParams.get("token");
  const access = await getTicketAccess(env, token);
  if (!access) return json({ success: false, error: "Acces candidat expire" }, 403);
  if (request.method === "POST") {
    const form = await request.formData();
    const payload = JSON.parse(String(form.get("payload") || "{}"));
    payload.discordUserId = access.userId;
    payload.discordChannelId = access.channelId;
    ctx.waitUntil(processApplicationSubmission(env, token, access, payload));
    return json({ success: true, id: "QCM" }, 202);
  }
  const target = new URL(env.APPS_SCRIPT_URL);
  for (const [key, value] of url.searchParams) {
    if (key !== "token") target.searchParams.append(key, value);
  }
  let body;
  if (request.method !== "GET") {
    const form = await request.formData();
    const payload = JSON.parse(String(form.get("payload") || "{}"));
    payload.discordUserId = access.userId;
    payload.discordChannelId = access.channelId;
    const encoded = new URLSearchParams();
    encoded.set("payload", JSON.stringify(payload));
    body = encoded.toString();
  }
  const upstream = await fetch(target, {
    method: request.method,
    headers: request.method === "GET" ? {} : { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
    redirect: "follow"
  });
  const responseText = await upstream.text();
  return new Response(responseText, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "text/plain;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
__name(proxyAppsScript, "proxyAppsScript");
async function adminLogin(request, env) {
  const body = await request.json();
  const target = new URL(env.APPS_SCRIPT_URL);
  target.searchParams.set("action", "auth");
  target.searchParams.set("username", String(body.username || ""));
  target.searchParams.set("password", String(body.password || ""));
  const response = await fetch(target, { redirect: "follow" });
  const result = await response.json();
  if (!result.valid) return corsJson(env, { success: false, error: "Identifiants incorrects" }, 401);
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  await env.TICKET_ACCESS.put(`admin-session:${token}`, "1", { expirationTtl: 8 * 60 * 60 });
  return corsJson(env, { success: true, token });
}
__name(adminLogin, "adminLogin");
async function requireAdmin(request, env) {
  const authorization = String(request.headers.get("authorization") || "");
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !await env.TICKET_ACCESS.get(`admin-session:${token}`)) return false;
  return true;
}
__name(requireAdmin, "requireAdmin");
async function applicationDecision(request, env) {
  if (!await requireAdmin(request, env)) {
    return corsJson(env, { success: false, error: "Session administrateur expir\xE9e" }, 401);
  }
  const body = await request.json();
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !["Accept\xE9e", "Refus\xE9e"].includes(status)) {
    return corsJson(env, { success: false, error: "D\xE9cision invalide" }, 400);
  }
  const ticket = await env.TICKET_ACCESS.get(`application:${id}`, "json");
  if (!ticket?.channelId || !ticket?.userId) {
    return corsJson(env, { success: false, error: "Aucun ticket li\xE9 \xE0 cette candidature. Demande au candidat de soumettre depuis son nouveau lien priv\xE9." }, 409);
  }
  const accepted = status === "Accept\xE9e";
  const description = accepted ? "Ta candidature est accept\xE9e. Le service recrutement te communiquera la suite directement dans ce ticket." : "Ta candidature n'est pas retenue cette fois-ci. Tu pourras d\xE9poser une nouvelle candidature dans **24 heures**.";
  await discord(env, `/channels/${ticket.channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `<@${ticket.userId}>`,
      allowed_mentions: { parse: [], users: [ticket.userId] },
      embeds: [{
        title: accepted ? "Candidature accept\xE9e" : "Candidature refus\xE9e",
        description,
        color: accepted ? 2278750 : 15680580,
        footer: { text: "BCSO • Service recrutement" },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]
    })
  });
  const accessToken = await env.TICKET_ACCESS.get(`channel:${ticket.channelId}`);
  if (accessToken) {
    await Promise.all([
      env.TICKET_ACCESS.delete(`token:${accessToken}`),
      env.TICKET_ACCESS.delete(`channel:${ticket.channelId}`)
    ]);
  }
  return corsJson(env, { success: true });
}
__name(applicationDecision, "applicationDecision");
function safeChannelName(username) {
  return String(username || "candidat").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "candidat";
}
__name(safeChannelName, "safeChannelName");
function defaultPanelConfig(env) {
  const support = [env.SUPPORT_ROLE_1_ID, env.SUPPORT_ROLE_2_ID].filter(Boolean);
  return {
    embed: {
      title: "BCSO — Centre de contact",
      intro: "S\xE9lectionnez le type de demande dans le menu ci-dessous pour ouvrir un ticket priv\xE9.",
      footer: "BCSO • Prot\xE9ger et servir",
      color: 14260786
    },
    categories: [
      {
        key: "recruitment",
        emoji: "\u{1F6E1}️",
        label: "Recrutement",
        dropdownDesc: "Candidature et questionnaire",
        panelLine: "\u{1F6E1}️ **Recrutement** — D\xE9poser une candidature et acc\xE9der au questionnaire.",
        prefix: "recrutement",
        channelTitle: "Recrutement BCSO",
        channelBody: "Le service recrutement lancera ton QCM lorsque tu seras pr\xEAt sur place.",
        categoryId: env.RECRUITMENT_CATEGORY_ID || "",
        staffRoleIds: [env.STAFF_ROLE_ID, env.RECRUITMENT_PING_ROLE_ID].filter(Boolean),
        isRecruitment: true
      },
      {
        key: "liaison",
        emoji: "\u{1F91D}",
        label: "Liaison",
        dropdownDesc: "Liaison officielle ou interservice",
        panelLine: "\u{1F91D} **Liaison** — Contacter le service pour une liaison officielle ou interservice.",
        prefix: "liaison",
        channelTitle: "Demande de liaison",
        channelBody: "Contacte le BCSO au sujet d'une liaison officielle ou interservice.",
        categoryId: env.LIAISON_CATEGORY_ID || "",
        staffRoleIds: support
      },
      {
        key: "information",
        emoji: "ℹ️",
        label: "Information",
        dropdownDesc: "Question ou renseignement",
        panelLine: "ℹ️ **Information** — Obtenir un renseignement ou poser une question.",
        prefix: "information",
        channelTitle: "Demande d'information",
        channelBody: "Pose une question ou demande un renseignement \xE0 l'\xE9quipe BCSO.",
        categoryId: env.INFORMATION_CATEGORY_ID || "",
        staffRoleIds: support
      },
      {
        key: "divers",
        emoji: "\u{1F4E9}",
        label: "Divers",
        dropdownDesc: "Toute autre demande",
        panelLine: "\u{1F4E9} **Divers** — Toute autre demande destin\xE9e au BCSO.",
        prefix: "divers",
        channelTitle: "Demande diverse",
        channelBody: "Pour toute demande qui ne correspond pas aux autres cat\xE9gories.",
        categoryId: env.DIVERS_CATEGORY_ID || "",
        staffRoleIds: support
      },
      {
        key: "contact_staff",
        emoji: "\u{1F396}️",
        label: "Contact Command Staff",
        dropdownDesc: "Contacter le Command Staff du BCSO",
        panelLine: "\u{1F396}️ **Contact Command Staff** — Contacter directement le Command Staff.",
        prefix: "cmd-staff",
        channelTitle: "Contact Command Staff",
        channelBody: "Un membre du Command Staff prendra contact avec vous dans les plus brefs d\xE9lais.",
        categoryId: "1518712602450985070",
        staffRoleIds: ["1518289587531939881"]
      }
    ]
  };
}
__name(defaultPanelConfig, "defaultPanelConfig");
async function getPanelConfig(env) {
  const stored = await env.TICKET_ACCESS.get("panel:config", "json");
  return stored || defaultPanelConfig(env);
}
__name(getPanelConfig, "getPanelConfig");
async function ticketConfig(env, type) {
  const config = await getPanelConfig(env);
  const cat = config.categories.find((c) => c.key === type);
  if (!cat) return null;
  return {
    prefix: cat.prefix,
    title: cat.channelTitle,
    description: cat.channelBody,
    categoryId: cat.categoryId,
    staffRoleIds: (cat.staffRoleIds || []).filter(Boolean)
  };
}
__name(ticketConfig, "ticketConfig");
async function addCandidateRole(env, userId) {
  return discord(env, `/guilds/${env.DISCORD_GUILD_ID}/members/${userId}/roles/${env.CANDIDATE_ROLE_ID}`, {
    method: "PUT"
  });
}
__name(addCandidateRole, "addCandidateRole");
async function removeCandidateRole(env, userId) {
  return discord(env, `/guilds/${env.DISCORD_GUILD_ID}/members/${userId}/roles/${env.CANDIDATE_ROLE_ID}`, {
    method: "DELETE"
  });
}
__name(removeCandidateRole, "removeCandidateRole");
async function resetPanelSelection(env, interaction) {
  if (!interaction.message?.id || !interaction.channel_id) return;
  const components = structuredClone(interaction.message.components || []);
  for (const row of components) {
    for (const component of row.components || []) {
      for (const option of component.options || []) delete option.default;
    }
  }
  await discord(env, `/channels/${interaction.channel_id}/messages/${interaction.message.id}`, {
    method: "PATCH",
    body: JSON.stringify({ components })
  });
}
__name(resetPanelSelection, "resetPanelSelection");
async function createPanelTicket(env, interaction, origin, type, info = {}) {
  const user = interaction.member.user;
  const config = await ticketConfig(env, type);
  if (!config) {
    await resetPanelSelection(env, interaction);
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Type de ticket inconnu.", flags: 64 }
    };
  }
  if (type === "recruitment") await addCandidateRole(env, user.id);
  const staffRoleIds = [...new Set(config.staffRoleIds.filter(Boolean))];
  const channel = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`, {
    method: "POST",
    body: JSON.stringify({
      name: `${config.prefix}-${safeChannelName(user.username)}`,
      type: 0,
      parent_id: config.categoryId,
      topic: `sasp-ticket:${type}:${user.id}`,
      permission_overwrites: [
        { id: env.DISCORD_GUILD_ID, type: 0, deny: VIEW_CHANNEL, allow: "0" },
        { id: user.id, type: 1, allow: CHANNEL_ALLOW, deny: "0" },
        ...staffRoleIds.map((id) => ({ id, type: 0, allow: CHANNEL_ALLOW, deny: "0" })),
        { id: env.DISCORD_APPLICATION_ID, type: 1, allow: CHANNEL_ALLOW, deny: "0" }
      ]
    })
  });
  const buttons = [];
  if (type === "recruitment") buttons.push({ type: 2, style: 1, label: "Lancer le QCM", custom_id: "launch_recruitment_qcm" });
  buttons.push({ type: 2, style: 4, label: "Fermer le ticket", custom_id: "close_recruitment_ticket" });
  const embeds = [];
  if (info.nom || info.prenom || info.telephone) {
    embeds.push({
      title: "Informations du demandeur",
      color: 3900150,
      fields: [
        { name: "Nom RP", value: info.nom || "—", inline: true },
        { name: "Pr\xE9nom RP", value: info.prenom || "—", inline: true },
        { name: "T\xE9l\xE9phone RP", value: info.telephone || "—", inline: true },
        { name: "Motivations", value: info.motivations || "—", inline: false },
        { name: "Disponibilit\xE9", value: info.disponibilite || "—", inline: false }
      ]
    });
  }
  embeds.push({ title: config.title, description: config.description, color: 14260786 });
  await discord(env, `/channels/${channel.id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `<@${user.id}> bienvenue dans ton ticket BCSO.
${staffRoleIds.map((id) => `<@&${id}>`).join(" ")}`,
      allowed_mentions: { parse: [], users: [user.id], roles: staffRoleIds },
      embeds,
      components: [{ type: 1, components: buttons }]
    })
  });
  await resetPanelSelection(env, interaction);
  return {
    type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `Ton ticket a \xE9t\xE9 cr\xE9\xE9 : <#${channel.id}>`, flags: 64 }
  };
}
__name(createPanelTicket, "createPanelTicket");
async function launchRecruitmentQcm(env, interaction, origin) {
  const channel = await discord(env, `/channels/${interaction.channel_id}`);
  const topic = String(channel.topic || "");
  const parts = topic.split(":");
  const type = topic.startsWith("sasp-recruitment-user:") ? "recruitment" : parts[1];
  const ownerId = topic.startsWith("sasp-recruitment-user:") ? topic.replace("sasp-recruitment-user:", "") : parts[2];
  const roles = interaction.member.roles || [];
  const canLaunch = roles.includes(env.RECRUITMENT_PING_ROLE_ID) || roles.includes(env.STAFF_ROLE_ID);
  if (!canLaunch) {
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Seul le service recrutement peut lancer le QCM.", flags: 64 }
    };
  }
  if (type !== "recruitment" || !ownerId) {
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Ce bouton fonctionne uniquement dans un ticket de recrutement.", flags: 64 }
    };
  }
  if (await env.TICKET_ACCESS.get(`qcm-completed:${interaction.channel_id}`)) {
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Ce candidat a d\xE9j\xE0 termin\xE9 son QCM.", flags: 64 }
    };
  }
  if (await env.TICKET_ACCESS.get(`channel:${interaction.channel_id}`)) {
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Le QCM est d\xE9j\xE0 en cours dans ce ticket.", flags: 64 }
    };
  }
  const token = crypto.randomUUID().replace(/-/g, "");
  const ttl = 6 * 60 * 60;
  await Promise.all([
    env.TICKET_ACCESS.put(`token:${token}`, JSON.stringify({ userId: ownerId, channelId: interaction.channel_id }), { expirationTtl: ttl }),
    env.TICKET_ACCESS.put(`channel:${interaction.channel_id}`, token, { expirationTtl: ttl })
  ]);
  await discord(env, `/channels/${interaction.channel_id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `<@${ownerId}> ton QCM est pr\xEAt. Ce lien est personnel et ne pourra \xEAtre utilis\xE9 qu'une seule fois.`,
      allowed_mentions: { parse: [], users: [ownerId] },
      embeds: [{
        title: "QCM de recrutement",
        description: "Lance le questionnaire uniquement lorsque le recruteur te le demande. Une fois envoy\xE9, il sera d\xE9finitivement verrouill\xE9.",
        color: 3900150
      }],
      components: [{
        type: 1,
        components: [{ type: 2, style: 5, label: "Commencer le QCM", url: `${origin}/recrutement?token=${token}` }]
      }]
    })
  });
  return {
    type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: "Le lien du QCM a \xE9t\xE9 envoy\xE9 au candidat.", flags: 64 }
  };
}
__name(launchRecruitmentQcm, "launchRecruitmentQcm");
async function closePanelTicket(env, interaction, ctx) {
  const channel = await discord(env, `/channels/${interaction.channel_id}`);
  const topic = String(channel.topic || "");
  const legacy = topic.startsWith("sasp-recruitment-user:");
  const parts = topic.split(":");
  const type = legacy ? "recruitment" : parts[1];
  const ownerId = legacy ? topic.replace("sasp-recruitment-user:", "") : parts[2];
  const config = await ticketConfig(env, type);
  const roles = interaction.member.roles || [];
  const allowed = interaction.member.user.id === ownerId || config && config.staffRoleIds.some((id) => roles.includes(id));
  if (!allowed || !ownerId) {
    return {
      type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Tu ne peux pas fermer ce ticket.", flags: 64 }
    };
  }
  if (type === "recruitment") await removeCandidateRole(env, ownerId);
  const token = await env.TICKET_ACCESS.get(`channel:${interaction.channel_id}`);
  if (token) {
    await Promise.all([
      env.TICKET_ACCESS.delete(`token:${token}`),
      env.TICKET_ACCESS.delete(`channel:${interaction.channel_id}`)
    ]);
  }
  ctx.waitUntil(new Promise((resolve) => setTimeout(resolve, 1200)).then(
    () => discord(env, `/channels/${interaction.channel_id}`, { method: "DELETE" })
  ));
  return {
    type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: type === "recruitment" ? "Ticket ferm\xE9. Le r\xF4le candidat a \xE9t\xE9 retir\xE9." : "Ticket ferm\xE9." }
  };
}
__name(closePanelTicket, "closePanelTicket");
async function installVerificationPanel(env) {
  const VERIF_CHANNEL = "1518752589750210784";
  const payload = {
    embeds: [{
      title: "🛡️ Bienvenue sur le serveur du BCSO",
      description: "Avant d'acc\xE9der au serveur, tu dois t'enregistrer avec ton identit\xE9 RP.\n\nClique sur le bouton ci-dessous, renseigne ton **Nom** et **Pr\xE9nom RP**, et tu obtiendras instantan\xE9ment l'acc\xE8s.",
      color: 14260786,
      footer: { text: "BCSO • Blaine County Sheriff’s Office" }
    }],
    components: [{ type: 1, components: [
      { type: 2, style: 1, label: "S’enregistrer", custom_id: "verify_identity", emoji: { name: "✅" } }
    ]}]
  };
  const messages = await discord(env, `/channels/${VERIF_CHANNEL}/messages?limit=50`);
  const existing = messages.find(
    (m) => m.author?.id === env.DISCORD_APPLICATION_ID && m.components?.some((r) => r.components?.some((c) => c.custom_id === "verify_identity"))
  );
  if (existing) {
    return discord(env, `/channels/${VERIF_CHANNEL}/messages/${existing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
  }
  return discord(env, `/channels/${VERIF_CHANNEL}/messages`, { method: "POST", body: JSON.stringify(payload) });
}
__name(installVerificationPanel, "installVerificationPanel");
async function installTicketPanel(env) {
  const cfg = await getPanelConfig(env);
  const embed = cfg.embed;
  const cats = cfg.categories;
  const payload = {
    embeds: [{
      title: embed.title,
      description: [embed.intro, "", ...cats.map((c) => c.panelLine), ""].join("\n"),
      color: embed.color || 14260786,
      footer: { text: embed.footer }
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "ticket_type_select",
        placeholder: "S\xE9lectionner un type de ticket…",
        min_values: 1,
        max_values: 1,
        options: cats.map((c) => ({ label: c.label, value: c.key, description: c.dropdownDesc, emoji: { name: c.emoji } }))
      }]
    }]
  };
  const messages = await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages?limit=50`);
  const existing = messages.find(
    (message) => message.author?.id === env.DISCORD_APPLICATION_ID && message.components?.some((row) => row.components?.some((component) => component.custom_id === "ticket_type_select"))
  );
  const panel = existing ? await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages/${existing.id}`, { method: "PATCH", body: JSON.stringify(payload) }) : await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages`, { method: "POST", body: JSON.stringify(payload) });
  const commands = await discord(env, `/applications/${env.DISCORD_APPLICATION_ID}/guilds/${env.DISCORD_GUILD_ID}/commands`);
  await Promise.all(commands.filter((command) => command.name === "ticket-recrutement").map((command) => discord(env, `/applications/${env.DISCORD_APPLICATION_ID}/guilds/${env.DISCORD_GUILD_ID}/commands/${command.id}`, { method: "DELETE" })));
  return panel;
}
__name(installTicketPanel, "installTicketPanel");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS" && url.pathname.startsWith("/admin/")) {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": new URL(env.SITE_URL).origin,
          "access-control-allow-headers": "authorization,content-type",
          "access-control-allow-methods": "GET,POST,OPTIONS"
        }
      });
    }
    if (url.pathname === "/health") return json({ ok: true });
    if (url.pathname === "/admin/install-panel" && request.method === "GET") {
      await installTicketPanel(env);
      return json({ ok: true });
    }
    if (url.pathname === "/admin/install-fiche-command" && request.method === "GET") {
      await discord(env, `/applications/${env.DISCORD_APPLICATION_ID}/guilds/${env.DISCORD_GUILD_ID}/commands`, {
        method: "POST",
        body: JSON.stringify({
          name: "fiche",
          description: "Affiche la fiche d'un agent BCSO",
          options: [{ type: 3, name: "matricule", description: "Matricule de l'agent (ex: B-042)", required: true }]
        })
      });
      return json({ ok: true, message: "Commande /fiche enregistrée." });
    }
    if (url.pathname === "/admin/install-verification" && request.method === "GET") {
      await installVerificationPanel(env);
      return json({ ok: true });
    }
    if (url.pathname === "/admin/login" && request.method === "POST") return adminLogin(request, env);
    if (url.pathname === "/admin/decision" && request.method === "POST") return applicationDecision(request, env);
    if (url.pathname === "/admin/panel" && request.method === "GET") {
      if (!await requireAdmin(request, env)) return corsJson(env, { success: false, error: "Session expir\xE9e" }, 401);
      const config = await getPanelConfig(env);
      return corsJson(env, { success: true, config });
    }
    if (url.pathname === "/admin/panel" && request.method === "POST") {
      if (!await requireAdmin(request, env)) return corsJson(env, { success: false, error: "Session expir\xE9e" }, 401);
      const body2 = await request.json();
      if (!body2.config || !Array.isArray(body2.config.categories)) {
        return corsJson(env, { success: false, error: "Config invalide" }, 400);
      }
      await env.TICKET_ACCESS.put("panel:config", JSON.stringify(body2.config));
      await installTicketPanel(env);
      return corsJson(env, { success: true });
    }
    if (url.pathname === "/recrutement" && request.method === "GET") return serveRecruitment(env, url);
    if (url.pathname === "/api" && (request.method === "GET" || request.method === "POST")) {
      return proxyAppsScript(request, env, url, ctx);
    }
    if (url.pathname !== "/interactions" || request.method !== "POST") {
      return new Response("BCSO Discord Bot", { status: 200 });
    }
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    const body = await request.text();
    const valid = signature && timestamp && await (0, import_discord_interactions.verifyKey)(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!valid) return new Response("Signature invalide", { status: 401 });
    const interaction = JSON.parse(body);
    try {
      if (interaction.type === import_discord_interactions.InteractionType.PING) {
        return json({ type: import_discord_interactions.InteractionResponseType.PONG });
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "ticket_type_select") {
        const type = interaction.data.values?.[0];
        return json({
          type: import_discord_interactions.InteractionResponseType.MODAL,
          data: {
            custom_id: `ticket_open:${type}`,
            title: "Informations requises",
            components: [
              { type: 1, components: [{ type: 4, custom_id: "nom", label: "Nom RP", style: 1, required: true, placeholder: "Ex : Morrison", min_length: 2, max_length: 50 }] },
              { type: 1, components: [{ type: 4, custom_id: "prenom", label: "Pr\xE9nom RP", style: 1, required: true, placeholder: "Ex : James", min_length: 2, max_length: 50 }] },
              { type: 1, components: [{ type: 4, custom_id: "telephone", label: "Num\xE9ro de t\xE9l\xE9phone RP", style: 1, required: true, placeholder: "Ex : 555-0198", min_length: 3, max_length: 20 }] },
              { type: 1, components: [{ type: 4, custom_id: "motivations", label: "Motivations", style: 2, required: true, placeholder: "Pourquoi ouvrez-vous ce ticket ?", min_length: 10, max_length: 500 }] },
              { type: 1, components: [{ type: 4, custom_id: "disponibilite", label: "Disponibilit\xE9", style: 1, required: true, placeholder: "Ex : En semaine apr\xE8s 18h", min_length: 3, max_length: 100 }] }
            ]
          }
        });
      }
      if (interaction.type === import_discord_interactions.InteractionType.MODAL_SUBMIT && interaction.data.custom_id?.startsWith("ticket_open:")) {
        const type = interaction.data.custom_id.replace("ticket_open:", "");
        const getValue = (id) => interaction.data.components?.flatMap((r) => r.components)?.find((c) => c.custom_id === id)?.value || "";
        const info = {
          nom: getValue("nom"),
          prenom: getValue("prenom"),
          telephone: getValue("telephone"),
          motivations: getValue("motivations"),
          disponibilite: getValue("disponibilite")
        };
        return json(await createPanelTicket(env, interaction, url.origin, type, info));
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "verify_identity") {
        return json({
          type: import_discord_interactions.InteractionResponseType.MODAL,
          data: {
            custom_id: "verify_modal",
            title: "Enregistrement BCSO",
            components: [
              { type: 1, components: [{ type: 4, custom_id: "nom_rp", label: "Nom RP", style: 1, required: true, placeholder: "Ex : Morrison", min_length: 2, max_length: 50 }] },
              { type: 1, components: [{ type: 4, custom_id: "prenom_rp", label: "Pr\xE9nom RP", style: 1, required: true, placeholder: "Ex : James", min_length: 2, max_length: 50 }] }
            ]
          }
        });
      }
      if (interaction.type === import_discord_interactions.InteractionType.MODAL_SUBMIT && interaction.data.custom_id === "verify_modal") {
        const getValue = (id) => interaction.data.components?.flatMap((r) => r.components)?.find((c) => c.custom_id === id)?.value || "";
        const nom = getValue("nom_rp");
        const prenom = getValue("prenom_rp");
        const userId = interaction.member.user.id;
        await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/members/${userId}/roles/1516510943318642951`, { method: "PUT" });
        return json({
          type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `✅ Bienvenue **${prenom} ${nom}** ! Tu as maintenant acc\xE8s au serveur BCSO.`,
            flags: 64
          }
        });
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "launch_recruitment_qcm") {
        return json(await launchRecruitmentQcm(env, interaction, url.origin));
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "close_recruitment_ticket") {
        return json({
          type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "⚠️ Es-tu s\xFBr de vouloir fermer ce ticket ?",
            flags: 64,
            components: [{ type: 1, components: [
              { type: 2, style: 4, label: "Fermer le ticket", custom_id: "confirm_close_ticket" },
              { type: 2, style: 2, label: "Annuler", custom_id: "cancel_close_ticket" }
            ]}]
          }
        });
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "confirm_close_ticket") {
        return json(await closePanelTicket(env, interaction, ctx));
      }
      if (interaction.type === import_discord_interactions.InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === "cancel_close_ticket") {
        return json({
          type: import_discord_interactions.InteractionResponseType.UPDATE_MESSAGE,
          data: { content: "Fermeture annul\xE9e.", components: [] }
        });
      }
      if (interaction.type === 2 && interaction.data.name === "fiche") {
        const matricule = (interaction.data.options?.[0]?.value || "").trim().toUpperCase();
        if (!matricule) return json({ type: 4, data: { content: "❌ Matricule manquant.", flags: 64 } });
        if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json({ type: 4, data: { content: "❌ Variables SUPABASE_URL / SUPABASE_ANON_KEY non configur\xE9es.", flags: 64 } });
        const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/agents?matricule=eq.${encodeURIComponent(matricule)}&select=*`, {
          headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` }
        });
        const agents = await resp.json();
        if (!Array.isArray(agents) || !agents.length) return json({ type: 4, data: { content: `❌ Aucun agent avec le matricule \`${matricule}\` trouv\xE9.`, flags: 64 } });
        const ag = agents[0];
        const ppas = [ag.ppa1, ag.ppa2, ag.ppa3].filter(Boolean).length;
        const unites = (ag.unites || []).join(", ") || "—";
        const statutColor = ag.statut === "Actif" ? 0x4caf50 : ag.statut === "Suspendu" ? 0xf59e0b : ag.statut === "Archiv\xE9" ? 0xe74c3c : 0x808080;
        return json({
          type: 4,
          data: {
            embeds: [{
              title: `👤 ${ag.prenom} ${ag.nom}`,
              color: statutColor,
              fields: [
                { name: "Matricule", value: `\`${ag.matricule}\``, inline: true },
                { name: "Grade", value: ag.grade || "—", inline: true },
                { name: "Statut", value: ag.statut || "—", inline: true },
                { name: "Divisions", value: unites, inline: true },
                { name: "Formations PPA", value: `${ppas}/3`, inline: true },
                { name: "Recrutement", value: ag.date_recrutement || "—", inline: true },
                ...(ag.telephone ? [{ name: "T\xE9l\xE9phone RP", value: ag.telephone, inline: true }] : []),
                ...(ag.is_formateur ? [{ name: "R\xF4le", value: "🎓 Formateur", inline: true }] : []),
                ...(ag.notes ? [{ name: "Notes", value: ag.notes.slice(0, 200) }] : [])
              ],
              footer: { text: "BCSO Intranet" },
              timestamp: new Date().toISOString()
            }]
          }
        });
      }
      return json({
        type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Interaction inconnue.", flags: 64 }
      });
    } catch (error) {
      return json({
        type: import_discord_interactions.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Erreur du bot : ${String(error.message || error).slice(0, 1400)}`, flags: 64 }
      });
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
