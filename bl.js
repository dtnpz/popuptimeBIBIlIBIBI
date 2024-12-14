// ==UserScript==
// @name         Bilibili TV Episode Info Popup
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Show episode ID and skip information in a custom HTML popup on Bilibili TV play pages
// @author       Your Name
// @match        https://www.bilibili.tv/th/play/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract episode ID from the URL
    function getEpisodeId() {
        const url = window.location.href;
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0]; // Extract the second-to-last part as the episode ID
    }

    // Function to extract media title from the header
    function getMediaTitle() {
        const titleElement = document.querySelector('header h1.bstar-meta__title a');
        return titleElement ? titleElement.textContent.trim() : 'N/A';
    }

    // Function to create and show the popup
    function createPopup(content) {
        const popup = document.createElement('div');
        popup.id = 'custom-popup';
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.right = '20px';
        popup.style.width = '420px';
        popup.style.backgroundColor = '#fff';
        popup.style.border = '1px solid #ccc';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        popup.style.padding = '15px';
        popup.style.zIndex = 10000;
        popup.style.fontFamily = 'Arial, sans-serif';
        popup.style.color = '#333';

        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; font-size: 16px;">Episode Info</h4>
                <button id="popup-close-btn" style="
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #999;
                ">&times;</button>
            </div>
            <div id="popup-content" style="margin-top: 10px; font-size: 14px;">
                ${content}
            </div>
        `;

        document.body.appendChild(popup);

        const closeButton = document.getElementById('popup-close-btn');
        closeButton.addEventListener('click', () => {
            popup.remove();
        });

        setTimeout(() => {
            if (popup) popup.remove();
        }, 30000);
    }

    // Function to send a request to the API and show the skip info along with episode ID and media title in the popup
    function fetchEpisodeInfo(episodeId, mediaTitle) {
        const apiUrl = `https://api.bilibili.tv/intl/gateway/web/v2/ogv/play/episode?s_locale=th_TH&platform=web&episode_id=${episodeId}`;
        const frameRate = 23.976;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': navigator.userAgent,
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://www.bilibili.tv',
                'Referer': window.location.href,
            },
        })
        .then(response => response.json())
        .then(data => {
            const skipInfo = data.data.skip;
            let opst = ((skipInfo.opening_start_time / 1000) * frameRate).toFixed(0);
            let oped = ((skipInfo.opening_end_time / 1000) * frameRate).toFixed(0);
            let edst = ((skipInfo.ending_start_time / 1000) * frameRate).toFixed(0);
            let eded = ((skipInfo.ending_end_time / 1000) * frameRate).toFixed(0);

            const content = `
                <p><strong>Media Title:</strong> ${mediaTitle}</p>
                <p><strong>Episode ID:</strong> ${episodeId}</p>
                <p><strong>Frames:</strong> ${opst}-${oped},,${edst}-${eded}--${mediaTitle}</p>
            `;
            createPopup(content);
        })
        .catch(error => {
            createPopup(`Error fetching skip information.<br><strong>Episode ID:</strong> ${episodeId}<br><strong>Media Title:</strong> ${mediaTitle}`);
            console.error('Error:', error);
        });
    }

    window.addEventListener('load', () => {
        const episodeId = getEpisodeId();
        const mediaTitle = getMediaTitle();
        if (episodeId) {
            fetchEpisodeInfo(episodeId, mediaTitle);
        } else {
            createPopup('Episode ID not found.');
        }
    });
})();
