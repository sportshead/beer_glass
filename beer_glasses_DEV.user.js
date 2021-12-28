// ==UserScript==
// @name         Torn: Gimme beer glasses
// @namespace    sportshead.dev
// @version      0.0.2
// @description  Gimme beer glasses!
// @author       sportzpikachu
// @match        https://www.torn.com/christmas_town.php*
// @grant        unsafeWindow
// @updateURL    https://github.com/sportshead/beer_glass/raw/master/beer_glasses_PROD.user.js
// @downloadURL  https://github.com/sportshead/beer_glass/raw/master/beer_glasses_PROD.user.js
// @supportURL   https://www.torn.com/forums.php#/p=threads&f=67&t=16255991&b=0&a=0
// ==/UserScript==
// Based on https://github.com/f2404/torn-userscripts/raw/master/gimme_beers.user.js by lugburz

/**
 * @param window {Window}
 * @param $ {jQuery}
 */
(function (window, $) {
    'use strict';
    // sanity check if we're on christmas town
    if (!window.location.href.includes("https://www.torn.com/christmas_town.php")) {
        return;
    }
    console.log('beer glasses run');
    const button = `<button id="buyBeerBtn" style="color: var(--default-blue-color); cursor: pointer; margin-right: 0;">Gimme beer glasses!</button>
    <span id="buyBeerResult" style="font-size: 12px; font-weight: 100;"></span>`;
    let active = false;

    // hook into window.fetch (https://stackoverflow.com/a/64961272/12573645)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        console.log('fetch intercepted');
        const response = await originalFetch(...args);
        if (response.url.includes('christmas_town.php?q=miniGameAction') && args[1].body.includes('{"gameType":"gameGiftShop","action":"getItems"}')) {
            console.log('fetch gameGiftShop');
            const res = await response.clone().json();
            // check if on beer tent
            if (res.shopType === 'Beer tent' && !active) {
                console.log('fetch beer tent');
                // hook after 100ms loading time - otherwise there is nothing to hook to
                setTimeout(() => {
                    hook(button);
                }, 100);
            }
        } else if (active && response.url.includes('christmas_town.php?q=move')) {
            console.log('fetch move');
            unHook();
        }

        // return original unmodified response
        return response;
    };

    function hook(button) {
        console.log('beer glasses hook');
        // make sure bucks are not 0
        if (getBucks() === 0 || active) {
            active = false;
            return;
        }
        active = true;
        if ($('#buyBeerBtn').size() < 1) {
            $('div.status-title > div').before(button);
            $('#buyBeerBtn').on('click', async () => {
                $('#buyBeerResult').text('');
                const obj = await $.ajax({
                    type: 'post',
                    url: 'christmas_town.php?q=miniGameAction',
                    contentType: 'application/json; charset=UTF-8',
                    data: JSON.stringify({
                        gameType: 'gameGiftShop',
                        action: 'buyItem',
                        result: {
                            giftShopType: 'basic',
                            itemType: 816,
                            itemCategory: 'tornItems'
                        }
                    })
                });
                if (obj.success === false) {
                    console.log('beer glasses error', obj);
                    $('#buyBeerResult').text(obj.error).css('color', 'red');
                } else if (obj.userData.userStatus === "ok") {
                    console.log('beer glasses bought');
                    $('#buyBeerResult').text('Added to your items.').css('color', 'green');

                    const bucks = getBucks();
                    if (bucks === 0) {
                        console.log('beer glasses no bucks');
                        unHook();
                    }
                    // set new bucks count
                    $('div.status-title > div > div > span > span').text(bucks);
                } else {
                    console.log('beer glasses error', obj);
                    $('#buyBeerResult').text(!!obj.userData.message.trim() ? obj.userData.message : 'Something went wrong.').css('color', 'red');
                }
            });
        } else {
            throw "Beer glasses button already exists!";
        }
    }

    function unHook() {
        console.log('beer glasses unhook');
        active = false;
        $('#buyBeerBtn').remove();
        $('#buyBeerResult').remove();
    }

    function getBucks() {
        // gets bucks from the item list
        return $('ul.items-list > li.bucks > span.quantity').text() || 0;
    }
})(unsafeWindow, unsafeWindow.jQuery);
