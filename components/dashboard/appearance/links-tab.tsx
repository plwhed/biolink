"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useToastStack } from "@/components/ui/toast-stack";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const platforms = [
  { id: "instagram", name: "Instagram", prefix: "instagram.com/", placeholder: "username", icon: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077", category: "social" },
  { id: "youtube", name: "YouTube", prefix: "youtube.com/@", placeholder: "channel", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", category: "creator" },
  { id: "tiktok", name: "TikTok", prefix: "tiktok.com/@", placeholder: "username", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", category: "creator" },
  { id: "discord", name: "Discord", prefix: "discord.gg/", placeholder: "invite", icon: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z", category: "social" },
  { id: "twitter", name: "X", prefix: "x.com/", placeholder: "username", icon: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z", category: "social" },
  { id: "github", name: "GitHub", prefix: "github.com/", placeholder: "username", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", category: "social" },
  { id: "telegram", name: "Telegram", prefix: "t.me/", placeholder: "username", icon: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z", category: "social" },
  { id: "snapchat", name: "Snapchat", prefix: "snapchat.com/add/", placeholder: "username", icon: "M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z", category: "social" },
  { id: "reddit", name: "Reddit", prefix: "reddit.com/u/", placeholder: "username", icon: "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z", category: "social" },
  { id: "twitch", name: "Twitch", prefix: "twitch.tv/", placeholder: "username", icon: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z", category: "creator" },
  { id: "lastfm", name: "Last.fm", prefix: "last.fm/user/", placeholder: "username", icon: "M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z", category: "music" },
  { id: "spotify", name: "Spotify", prefix: "open.spotify.com/user/", placeholder: "username", icon: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z", category: "music" },
  { id: "bitcoin", name: "Bitcoin", prefix: "bitcoin.org/", placeholder: "address", icon: "M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z", category: "crypto" },
  { id: "ethereum", name: "Ethereum", prefix: "etherscan.io/address/", placeholder: "address", icon: "M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z", category: "crypto" },
  { id: "solana", name: "Solana", prefix: "solscan.io/account/", placeholder: "address", icon: "m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z", category: "crypto" },
  { id: "paypal", name: "PayPal", prefix: "paypal.me/", placeholder: "username", icon: "M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z", category: "payments" },
  { id: "steam", name: "Steam", prefix: "steamcommunity.com/id/", placeholder: "username", icon: "M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z", category: "gaming" },
  { id: "roblox", name: "Roblox", prefix: "roblox.com/users/", placeholder: "user-id", icon: "M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z", category: "gaming" },
  { id: "soundcloud", name: "SoundCloud", prefix: "soundcloud.com/", placeholder: "username", icon: "M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z", category: "music" },
  { id: "kick", name: "Kick", prefix: "kick.com/", placeholder: "username", icon: "M1.333 0h8v5.333H12V2.667h2.667V0h8v8H20v2.667h-2.667v2.666H20V16h2.667v8h-8v-2.667H12v-2.666H9.333V24h-8Z", category: "creator" },
  { id: "onlyfans", name: "OnlyFans", prefix: "onlyfans.com/", placeholder: "username", icon: "M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173 0 0-2.399.585-4.43 0 4.018-.777 6.333-3.037 7.005-5.995zM5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996 7.996 7.996 0 0 0-7.996-7.996Zm0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z", category: "creator" },
  { id: "custom", name: "Custom", prefix: "https://", placeholder: "ur site url here :p", icon: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z", category: "other" },
];

type Platform = (typeof platforms)[number];

interface SocialLink {
  id?: string | number;
  platform: string;
  url: string;
  iconUrl?: string | null;
  order: number;
}

const editPath =
  "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10";

const trashPath =
  "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0";

function stripUrl(url: string) {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
}

function parseUsername(p: Platform, url: string) {
  const s = stripUrl(url);
  const pre = p.prefix.toLowerCase();

  if (s.toLowerCase().startsWith(pre)) {
    return s
      .slice(pre.length)
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "");
  }

  const segs = s
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean);

  return (segs.length > 1 ? segs[segs.length - 1] : "").replace(/^@+/, "");
}

function cleanInput(p: Platform, raw: string) {
  const s = raw.replace(/\s/g, "");
  const host = p.prefix.split("/")[0].toLowerCase();

  if (
    /^(https?:\/\/|www\.)/i.test(s) ||
    s.toLowerCase().startsWith(`${host}/`)
  ) {
    return parseUsername(p, s);
  }

  return s.replace(/^@+/, "");
}

function splitLink(link: SocialLink) {
  const p = platforms.find((x) => x.id === link.platform);

  if (!p) {
    return { prefix: "", username: stripUrl(link.url) };
  }

  const s = stripUrl(link.url);

  if (s.toLowerCase().startsWith(p.prefix.toLowerCase())) {
    return {
      prefix: p.prefix,
      username: s.slice(p.prefix.length),
    };
  }

  return {
    prefix: "",
    username: s,
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
      <div className="border-b border-[#1b1b1b] p-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-zinc-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function IconButton({
  label,
  onClick,
  path,
  tone,
}: {
  label: string;
  onClick: () => void;
  path: string;
  tone: "pink" | "red";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-[background-color,color,transform] duration-200 active:scale-90 ${
        tone === "pink"
          ? "hover:bg-pink-500/10 hover:text-pink-400"
          : "hover:bg-red-500/10 hover:text-red-400"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={path}
        />
      </svg>
    </button>
  );
}

export default function LinksTab({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const [links, setLinks] = useState<SocialLink[]>(
    initialLinks.map((l, i) => ({
      ...l,
      order: l.order ?? i,
    }))
  );
  const [baselineLinks, setBaselineLinks] = useState<SocialLink[]>(
    initialLinks.map((l, i) => ({
      ...l,
      order: l.order ?? i,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { pushToast } = useToastStack();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [selected, setSelected] = useState<Platform | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [isDraggingCustomIcon, setIsDraggingCustomIcon] = useState(false);
  const [isUploadingCustomIcon, setIsUploadingCustomIcon] = useState(false);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const hasCustomIconSource = Boolean(customIconUrl && customIconUrl.trim());

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const openModal = (p: Platform, index: number | null) => {
    clearTimeout(timer.current);

    setSelected(p);
    setEditIndex(index);
    setUsername(index !== null ? parseUsername(p, links[index].url) : "");
    setCustomIconUrl(index !== null && links[index].platform === "custom" ? links[index].iconUrl ?? null : null);
    setMounted(true);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => setShown(true))
    );
  };

  const closeModal = useCallback(() => {
    setShown(false);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setMounted(false);
      setSelected(null);
      setEditIndex(null);
      setUsername("");
      setCustomIconUrl(null);
    }, 250);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, closeModal]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const countFor = (id: string) =>
    links.filter((l) => l.platform === id).length;

  const baselineSignature = useMemo(
    () =>
      JSON.stringify(
        baselineLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
          iconUrl: link.iconUrl ?? null,
          order: link.order ?? 0,
        }))
      ),
    [baselineLinks]
  );

  const currentSignature = useMemo(
    () =>
      JSON.stringify(
        links.map((link) => ({
          platform: link.platform,
          url: link.url,
          iconUrl: link.iconUrl ?? null,
          order: link.order ?? 0,
        }))
      ),
    [links]
  );

  const dirtyCount = currentSignature === baselineSignature ? 0 : 1;

  useDashboardDirtyState("links", {
    count: dirtyCount,
    onSave: handleSave,
    onUndo: handleUndo,
  });

  function handleUndo() {
    setLinks(
      baselineLinks.map((link, index) => ({
        ...link,
        order: index,
      }))
    );
  }

  async function handleCustomIconUpload(file: File | null) {
    if (!file) return;

    setIsUploadingCustomIcon(true);
    setCustomIconUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setCustomIconUrl(data.url);
      } else {
        setCustomIconUrl(null);
      }
    } catch {
      setCustomIconUrl(null);
    } finally {
      setIsUploadingCustomIcon(false);
    }
  }

  function handleCustomIconFiles(files: FileList | null | undefined) {
    const file = files?.[0];
    if (!file) return;
    void handleCustomIconUpload(file);
  }

  function handleSaveUrl() {
    if (!selected || !username.trim()) return;
    if (selected.id === "custom" && !customIconUrl) return;

    const raw = username.trim();
    const url =
      selected.id === "custom"
        ? /^https?:\/\//i.test(raw)
          ? raw
          : `https://${raw}`
        : `https://${selected.prefix}${raw}`;

    setLinks((prev) => {
      if (editIndex !== null && editIndex < prev.length) {
        return prev.map((l, i) =>
          i === editIndex
            ? {
                ...l,
                platform: selected.id,
                url,
                iconUrl: selected.id === "custom" ? customIconUrl : l.iconUrl,
              }
            : l
        );
      }

      return [
        ...prev,
        {
          platform: selected.id,
          url,
          iconUrl: selected.id === "custom" ? customIconUrl : null,
          order: prev.length,
        },
      ];
    });

    closeModal();
  }

  function removeAt(index: number) {
    setLinks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((l, i) => ({
          ...l,
          order: i,
        }))
    );
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (
      dragItem.current === null ||
      dragOverItem.current === null
    ) {
      return;
    }

    const items = [...links];
    const dragged = items.splice(dragItem.current, 1)[0];

    items.splice(dragOverItem.current, 0, dragged);

    dragItem.current = null;
    dragOverItem.current = null;

    setLinks(
      items.map((l, i) => ({
        ...l,
        order: i,
      }))
    );
  }

  async function handleSave() {
    if (dirtyCount === 0 || saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          socialLinks: links.map((l, i) => ({
            platform: l.platform,
            url: l.url,
            iconUrl: l.iconUrl ?? null,
            order: i,
          })),
        }),
      });

      if (!response.ok) {
        let message = "Could not save your social links.";

        try {
          const payload = await response.json();
          if (payload && typeof payload.error === "string" && payload.error.trim()) {
            message = payload.error;
          }
        } catch {
          try {
            const text = await response.text();
            if (text && text.trim()) {
              message = text.trim();
            }
          } catch {}
        }

        throw new Error(message);
      }

      setBaselineLinks(
        links.map((link, index) => ({
          ...link,
          order: index,
        }))
      );
      pushToast("Links Saved!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save your social links.";

      setSaveError(message);
      pushToast(message);
    } finally {
      setSaving(false);
    }
  }

  const editing = editIndex !== null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
        <h2 className="text-2xl font-bold text-white">
          Links Settings
        </h2>
        <p className="text-zinc-400">
          Manage your social links!
        </p>
      </div>

      <Section
        title="Platforms"
        description="Pick a platform to add a link!"
      >
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const count = countFor(p.id);
            const active = count > 0;

            return (
              <div key={p.id} className="group relative">
                <button
                  type="button"
                  aria-label={`Add ${p.name} link`}
                  title={p.name}
                  onClick={() => openModal(p, null)}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-xl border transition-[border-color,background-color,transform] duration-200 active:scale-95 ${
                    active
                      ? "border-pink-500/40 bg-pink-500/10"
                      : "border-[#1b1b1b] bg-[#080808] hover:border-white/20"
                  }`}
                >
                  {active && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-bold text-white">
                      {count}
                    </span>
                  )}

                  <svg
                    className={`h-6 w-6 fill-current transition-colors duration-200 ${
                      active
                        ? "text-pink-400"
                        : "text-white/50 group-hover:text-white"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d={p.icon} />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {links.length > 0 && (
        <Section
          title="Your Links"
          description="Drag to change the order they appear in"
        >
          <div className="space-y-3">
            {links.map((link, index) => {
              const p = platforms.find(
                (pp) => pp.id === link.platform
              );

              const { prefix, username: name } = splitLink(link);

              return (
                <div
                  key={`${link.platform}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex cursor-grab items-center gap-3 rounded-xl border border-[#1b1b1b] bg-[#080808] p-3 transition-colors duration-200 hover:border-white/20 active:cursor-grabbing"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M4 8h16M4 16h16" />
                  </svg>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                    {p && (
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d={p.icon} />
                      </svg>
                    )}
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="text-white/35">
                      {prefix}
                    </span>
                    <span className="font-medium text-white">
                      {name}
                    </span>
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconButton
                      label="Edit"
                      path={editPath}
                      tone="pink"
                      onClick={() =>
                        p && openModal(p, index)
                      }
                    />

                    <IconButton
                      label="Remove"
                      path={trashPath}
                      tone="red"
                      onClick={() => removeAt(index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {saveError && (
        <p
          role="alert"
          className="text-xs text-red-400"
        >
          {saveError}
        </p>
      )}

      {mounted &&
        selected &&
        createPortal(
          <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ease-out ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              onClick={closeModal}
              className="absolute inset-0 bg-black/80"
            />

            <div
              className={`${montserrat.className} relative w-full max-w-sm transform-gpu rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-[transform,opacity] duration-250 ease-out will-change-transform ${
                shown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-4 scale-95 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                    <svg
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d={selected.icon} />
                    </svg>
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {selected.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-5 flex h-10 items-center rounded-lg border border-[#1b1b1b] bg-[#080808] transition-colors hover:border-white/20 focus-within:border-pink-500/40">
                <span className="select-none whitespace-nowrap pl-3 text-sm font-medium text-white/40">
                  {selected.id === "custom" ? "" : selected.prefix}
                </span>

                <input
                  type="text"
                  name="social-handle-field"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      selected.id === "custom"
                        ? e.target.value.trimStart()
                        : cleanInput(selected, e.target.value)
                    )
                  }
                  placeholder={selected.placeholder}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSaveUrl()
                  }
                  className="min-w-0 flex-1 !appearance-none !border-0 !bg-transparent py-2 pl-0.5 pr-3 text-sm font-medium text-white !shadow-none !outline-none !ring-0 placeholder:text-white/20 focus:!border-0 focus:!bg-transparent focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none"
                  style={{
                    backgroundColor: "transparent",
                    WebkitBoxShadow: "none",
                    boxShadow: "none",
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                  }}
                />
              </div>

              {selected.id === "custom" && (
                <>
                  <div className="mt-5">
                    <div
                      className={`relative aspect-video overflow-hidden rounded-xl border bg-[#080808] transition-all duration-300 ${
                        isDraggingCustomIcon
                          ? "border-pink-500/40 bg-pink-500/5"
                          : "border-zinc-700/30"
                      }`}
                    >
                      {hasCustomIconSource && (
                        <button
                          type="button"
                          onClick={() => setCustomIconUrl(null)}
                          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-[#1b1b1b] bg-[#080808]/80 text-zinc-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500 hover:scale-110"
                          aria-label="Remove custom icon"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!hasCustomIconSource) customInputRef.current?.click();
                        }}
                        disabled={hasCustomIconSource || isUploadingCustomIcon}
                        onDragOver={(event) => {
                          if (hasCustomIconSource) return;
                          event.preventDefault();
                          setIsDraggingCustomIcon(true);
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault();
                          setIsDraggingCustomIcon(false);
                        }}
                        onDrop={(event) => {
                          if (hasCustomIconSource) return;
                          event.preventDefault();
                          setIsDraggingCustomIcon(false);
                          handleCustomIconFiles(event.dataTransfer.files);
                        }}
                        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-400 transition-all duration-500 hover:text-white group/upload disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingCustomIcon ? (
                          <div className="flex flex-col items-center justify-center gap-3 p-6">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500/30 border-t-pink-500" />
                            <p className="text-sm font-medium text-zinc-300">
                              Uploading...
                            </p>
                          </div>
                        ) : customIconUrl ? (
                          <div className="flex flex-col items-center justify-center gap-3 p-6">
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-white/10">
                              <Image
                                src={customIconUrl}
                                alt="Custom icon preview"
                                width={80}
                                height={80}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <p className="text-sm font-medium text-zinc-300">
                              Replace image
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-4 p-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500 ring-1 ring-pink-500/20">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6 text-pink-500"
                                aria-hidden="true"
                              >
                                <path d="M12 16V4" />
                                <path d="M7 9l5-5 5 5" />
                                <path d="M5 15.5v2A2.5 2.5 0 0 0 7.5 20h9A2.5 2.5 0 0 0 19 17.5v-2" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-zinc-300">
                                Drag and drop or click to upload
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={customInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            handleCustomIconFiles(event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-white/70">
                      Or paste a URL
                    </p>
                    <div className="flex h-10 items-center rounded-lg border border-[#1b1b1b] bg-[#080808] transition-colors hover:border-white/20 focus-within:border-pink-500/40">
                      <input
                        type="text"
                        name="custom-image-url"
                        value={customIconUrl ?? ""}
                        onChange={(e) => {
                          const nextValue = e.target.value.trimStart();
                          setCustomIconUrl(nextValue || null);
                        }}
                        placeholder="URL here"
                        disabled={hasCustomIconSource}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="min-w-0 flex-1 !appearance-none !border-0 !bg-transparent py-2 pl-3 pr-3 text-sm font-medium text-white !shadow-none !outline-none !ring-0 placeholder:text-white/20 focus:!border-0 focus:!bg-transparent focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none disabled:cursor-not-allowed disabled:text-white/40"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "none",
                          boxShadow: "none",
                          color: "#ffffff",
                          WebkitTextFillColor: "#ffffff",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mt-5 flex items-center gap-2">
                {editing && (
                  <IconButton
                    label="Remove"
                    path={trashPath}
                    tone="red"
                    onClick={() => {
                      if (editIndex !== null) {
                        removeAt(editIndex);
                      }

                      closeModal();
                    }}
                  />
                )}

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/40 transition-colors hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveUrl}
                  disabled={
                    !username.trim() ||
                    (selected?.id === "custom" && !customIconUrl)
                  }
                  className="rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 active:scale-[0.98] disabled:opacity-40"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}