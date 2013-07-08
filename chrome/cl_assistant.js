// CL Assistant
// version 0.0.3 BETA!
// 2010-06-02
// Copyright (c) 2010,2011,2012,2013 Brett Trimble
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// This was a Greasemonkey user script.
//
// To install, you need Greasemonkey: https://addons.mozilla.org/en-US/firefox/addon/748
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "CL Assistant", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          CL Assistant
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @namespace     http://vervet.net
// @description   A craigslist search assistant to allow you to group listings, mark listings as read, save listings, record e-mails, cache pictures, etc..
// @include       http://*.craigslist.org/*
// @include       http://craigslist.org/*
// @exclude       http://craigslist.org/
// @exclude       http://*.craigslist.org/
// @exclude       http://craigslist.org/cgi-bin/*
// @exclude       http://*.craigslist.org/cgi-bin/*
// ==/UserScript==

document.CLasstServer='127.0.0.1:8080';

function getLinkFromButton(target)
{
    target = target.parentNode;
    while (target)
    {
        if (target.tagName.toUpperCase() != 'A')
        {
            target = target.nextElementSibling;
            continue;
        }
        console.log("/cragislist/.test('" + target.href + "') = " + /craigslist/.test(target.href));
        if (/craigslist/.test(target.href))
            return target;
            
        target = target.nextElementSibling;            
    }
    return null;
}
function getIdFromUrl(url)
{
    return url.replace(/http:\/\/[a-z]+\.craigslist\.org\/[a-z]+\/[a-z]+\/([0-9]+)\.html/, '$1');
}
function resetListings(evt)
{
    console.log("resetListings!");
    localStorage.removeItem('CLlistings');
    localStorage.removeItem('CLsaved');
    var listings = getAllListings();
    showHideAllListings(listings, false);
}
function showHidden(evt)
{
    var listings = getAllListings();
    var show = (evt.target.innerHTML == 'Show Hidden');
    
    showHideAllListings(listings, show);
    evt.target.innerHTML = show ? 'Hide Hidden' : 'Show Hidden';
}
function showSaved(evt)
{
    var firstHeader = document.evaluate(
        "//h4",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null);
        //console.log(typeof firstHeader);
    var node    = firstHeader.singleNodeValue.parentNode.firstChild;
    var nxtNode;
    while (node)
    {
        if (node.id == 'footer')
            break;
        
        nxtNode = node.nextSibling;
        node.parentNode.removeChild(node);
        node = nxtNode;
    }
        
        
    if (!node) return;
    var p = node.parentNode;
    var savedH = loadHash('CLsaved');
    for (var i in savedH)
    {
        console.log(i);
        var pelem = document.createElement('p');
        console.log(savedH[i]);
        pelem.innerHTML = savedH[i];
        p.insertBefore(pelem, node);
    }
    history.pushState(null, 'Saved Entries', window.location);
}
function consolListings(evt)
{
}
function hideListing(evt)
{
    var link  = getLinkFromButton(evt.target);
    console.log(link.href);

    var listH = loadHash('CLlistings');
    switch (listH[link.href])
    {
        case 'hidden':
            delete listH[link.href];
            break;
        case 'saved':
            listH[link.href] = 'hidden|saved';
            break;
        case 'hidden|saved':
            listH[link.href] = 'saved';
            break;
        default:
            listH[link.href] = 'hidden';
            break;
    }
    saveHash('CLlistings', listH);
    evt.target.parentNode.parentNode.parentNode.style.display = (evt.target.innerHTML=='hide') ? 'none' : null;
    evt.target.innerHTML=(evt.target.innerHTML=='hide') ? 'show' : 'hide';
}
function saveListing(evt)
{
    var link  = getLinkFromButton(evt.target);
    var saved = 'false';
    console.log(link.href);

    var listH = loadHash('CLlistings');
    switch (listH[link.href])
    {
        case 'hidden':
            listH[link.href] = 'hidden|saved';
            saved = 'true';
            break;
        case 'saved':
            delete listH[link.href];
            break;
        case 'hidden|saved':
            listH[link.href] = 'hidden';
            break;
        default:
            listH[link.href] = 'saved';
        	saved = 'true';
            break;
    }
    
    //jQuery.post(document.CLasstServer + "/save", { url: link, saved: saved })
    saveHash('CLlistings', listH);
    var savedH = loadHash('CLsaved');
    var id     = getIdFromUrl(link.href);
    if (evt.target.innerHTML=='save')
        savedH[id] = link.parentNode.innerHTML;
    else
        delete savedH[id];
    
    saveHash('CLsaved', savedH);
    evt.target.innerHTML=(evt.target.innerHTML=='save') ? 'saved' : 'save';
}
function tagListing(evt)
{
}
function loadHash(nm)
{
    var listH = {};
    var listings = localStorage.getItem(nm);
    if (!listings)
        return listH;
    listings = listings.split('()*()*()*()');
    for (var i = 0; i < listings.length; i++)
    {
        var listP = listings[i].split('++==++');
        listH[listP[0]] = listP[1];
    }
    return listH;
}
function saveHash(nm, listH)
{
    var str = "";
     // show the values stored
    for (var i in listH)
    {
        if (str != '')
            str += '()*()*()*()';
        str += i + '++==++' + listH[i];
    }
    localStorage.setItem(nm, str);
}
function createCLassistantPanel()
{
    var firstHeader = document.evaluate(
        "//h4[1]",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
        
    firstHeader = firstHeader.snapshotItem(0);
    var CLasstPanel = document.createElement('small');
    CLasstPanel.innerHTML = '<br>[<a href="javascript:void(0)">Show Hidden</a>]  [<a href="javascript:void(0)">Show Saved</a>]  [<a href="javascript:void(0)">Show Unread</a>]  [<a href="javascript:void(0)">Consolidate All Listings</a>]  [<a href="javascript:void(0)">Reset</a>]</br>';
    firstHeader.parentNode.insertBefore(CLasstPanel, firstHeader);
    var lnk = CLasstPanel.firstElementChild.nextElementSibling;
    lnk.addEventListener("click", showHidden, false);
    lnk = lnk.nextElementSibling;
    lnk.addEventListener("click", showSaved, false);
    lnk = lnk.nextElementSibling.nextElementSibling;
    lnk.addEventListener("click", consolListings, false);
    lnk = lnk.nextElementSibling;
    lnk.addEventListener("click", resetListings, false);
}
function addPanelToAllListings(listings)
{
    console.log('addPanelToAllListings');
    if (listings.snapshotLength <= 0) return;

    var listingPanel, hideLink, saveLink, tagLink, spacer;
    var listH = loadHash('CLlistings');

    for (var i = 0; i < listings.snapshotLength; i++)
    {
        listing = listings.snapshotItem(i);
        panelC           = document.createElement('small');
        switch (listH[listing.href])
        {
            case 'hidden':
                panelC.innerHTML = "[<a href='javascript:void(0)'>show</a>] [<a href='javascript:void(0)'>save</a>] [<a href='javascript:void(0)'>+tag</a>]  ";
                break;
            case 'saved':
                panelC.innerHTML = "[<a href='javascript:void(0)'>hide</a>] [<a href='javascript:void(0)'>saved</a>] [<a href='javascript:void(0)'>+tag</a>]  ";
                break;
            case 'hidden|saved':
                panelC.innerHTML = "[<a href='javascript:void(0)'>show</a>] [<a href='javascript:void(0)'>saved</a>] [<a href='javascript:void(0)'>+tag</a>]  ";
                break;
            default:
                panelC.innerHTML = "[<a href='javascript:void(0)'>hide</a>] [<a href='javascript:void(0)'>save</a>] [<a href='javascript:void(0)'>+tag</a>]  ";
                break;
        }
        
        hideLink         = panelC.firstElementChild;
        hideLink.addEventListener("click", hideListing, true);
        hideLink         = hideLink.nextElementSibling;
        hideLink.addEventListener("click", saveListing, true);
        hideLink         = hideLink.nextElementSibling;
        hideLink.addEventListener("click", tagListing, true);
        listing.parentNode.insertBefore(panelC, listing.parentNode.firstChild);
    }
}
function showHideAllListings(listings, showAll)
{
    console.log('showHideAllListings');
    if (listings.snapshotLength <= 0) return;
    var listH = loadHash('CLlistings'), listing;

    for (var i = 0; i < listings.snapshotLength; i++)
    {
        listing = listings.snapshotItem(i);
        if (/hidden/.test(listH[listing.href]) && !showAll)
        {
            console.log("Hiding " + listing.href);
            listing.parentNode.parentNode.style.display='none'; //.parentNode.removeChild(listing.parentNode);
        }
        else
        {
           listing.parentNode.parentNode.style.display=null;
        }
    }
}
function getAllListings()
{
    return document.evaluate(
        "//p/span/a[1]",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);
}




//var logo = document.createElement('img');
//logo.src = 'data:image/gif;base64,R0lGODlhDQAOAJEAANno6wBmZgAAAAAAACH5BAAAAAAA'+
//    'LAAAAAANAA4AQAIjjI8Iyw3GhACSQecutsFV3nzgNi7SVEbo06lZa66LRib2UQAAOw%3D%3D';

//alert('HELP!');

var listing, panelC;
var listings = getAllListings();
if (listings.snapshotLength <= 0) return;

createCLassistantPanel();
addPanelToAllListings(listings);
showHideAllListings(listings, false);

