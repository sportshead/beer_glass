// ==UserScript==
// @name         Torn: Gimme beer glasses
// @namespace    dev.sportshead.gimme_beer_glasses
// @version      0.0.1
// @description  Gimme beer glasses!
// @author       sportzpikachu
// @match        https://www.torn.com/christmas_town.php*
// @grant        unsafeWindow
// ==/UserScript==
// Based on https://github.com/f2404/torn-userscripts/raw/master/gimme_beers.user.js by lugburz

/**
 * @param window {Window}
 * @param $ {jQuery}
 * @param getAction {(data: xhrData) => Promise<any>}))}
 */
(function (window, $, getAction) {
    'use strict';
    console.log('beer glasses run');
    const button = `<button id="buyBeerBtn" style="color: var(--default-blue-color); cursor: pointer; margin-right: 0;">Gimme beer glasses!</button>
    <span id="buyBeerResult" style="font-size: 12px; font-weight: 100;"></span>`;
    let active = false;

    // hook into window.fetch (https://stackoverflow.com/a/64961272/12573645)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        console.log('fetch intercepted');
        /** @type {Response} */
        const response = await originalFetch(...args);
        // check if url contains "christmas_town.php?q=miniGameAction", and if request matches {"gameType":"gameGiftShop","action":"getItems"}
        if (response.url.includes('christmas_town.php?q=miniGameAction') && args[1].body.includes('{"gameType":"gameGiftShop","action":"getItems"}')) {
            console.log('fetch gameGiftShop')
            const res = await response.clone().json();
            // check if shopType: Beer tent
            if (res.shopType === 'Beer tent' && !active) {
                console.log('fetch beer tent');
                // hook after 100ms loading time
                setTimeout(() => {
                    hook(button);
                    active = true;
                }, 100);
            }
        } // else if active and url contains https://www.torn.com/christmas_town.php?q=move
        else if (active && response.url.includes('christmas_town.php?q=move')) {
            console.log('fetch move');
            unHook();
            active = false;
        }

        // return original unmodified response
        return response;
    };

    function hook(button) {
        console.log('beer glasses hook');
        if ($('#buyBeerBtn').size() < 1) {
            $('div.status-title > div').before(button);
            $('#buyBeerBtn').on('click', async () => {
                $('#buyBeerResult').text('');
                /* await getAction({
                    type: 'post',
                    action: 'christmas_town.php?q=miniGameAction',
                    contentType: 'application/json; charset=UTF-8',
                    data: JSON.stringify({
                        gameType: 'gameGiftShop',
                        action: 'buyItem',
                        result: {
                            giftShopType: 'basic',
                            itemType: 816,
                            itemCategory: 'tornItems'
                        }
                    }),
                    success: (obj) => {
                        if (!obj.success) {
                            console.log('beer glasses error', obj);
                            $('#buyBeerResult').text(obj.error).css('color', 'red');
                        } else if (obj.userData.userStatus === "ok") {
                            console.log('beer glasses bought');
                            $('#buyBeerResult').text('Added to your items.').css('color', 'green');
                        } else {
                            console.log('beer glasses error', obj);
                            $('#buyBeerResult').text(!!obj.userData.message.trim() ? obj.userData.message : 'Something went wrong.').css('color', 'red');
                        }
                    }
                }); */
                // post to 'christmas_town.php?q=miniGameAction' with data {gameType: 'gameGiftShop',action: 'buyItem',result: {giftShopType: 'basic',itemType: 816,itemCategory: 'tornItems'}}
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

                    // set new bucks count ("div.status-title > div > div > span > span") to value of "ul.items-list > il.bucks > span.quantity"
                    $('div.status-title > div > div > span > span').text($('ul.items-list > li.bucks > span.quantity').text());
                } else {
                    console.log('beer glasses error', obj);
                    $('#buyBeerResult').text(!!obj.userData.message.trim() ? obj.userData.message : 'Something went wrong.').css('color', 'red');
                }
            });
        }
    }

    function unHook() {
        console.log('beer glasses unhook');
        $('#buyBeerBtn').remove();
        $('#buyBeerResult').remove();
    }
})(unsafeWindow, unsafeWindow.jQuery, unsafeWindow.getAction);
