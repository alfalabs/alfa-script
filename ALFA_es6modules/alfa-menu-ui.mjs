/*! alfa-menu-ui.js  20.12.24  (C) alfadigital.net 2018  */

/** menu data item:  {text: payload}

        payload = Object
                   or
                  Array  
 */

/** dependencies */
import AlfaCollapsibleAnim from './alfa-collapsible-anim-ui.mjs';

import AlfaConsoleLog from './alfa-console-log.mjs'; 
var alfaConsoleLog = new AlfaConsoleLog('alfa-menu-ui')
var log =     alfaConsoleLog.log.bind(alfaConsoleLog)
var logWarn = alfaConsoleLog.logWarn.bind(alfaConsoleLog)
var logErr =  alfaConsoleLog.logErr.bind(alfaConsoleLog)




// poor mans jQuery:
const $dqs = document.querySelector.bind(document); 
const $dce = document.createElement.bind(document); 
const $dcf = document.createDocumentFragment.bind(document);

/**
 * 
 * @param {*} menuData 
 * @param {*} elementSelector 
 * @param {*} opts  - {
 *          controlsContainerSelector                   - if supplied, open All close All are used
 *          levelIndent: 0   - integer in  px
 *          uriEncoding: false
 *          ... todo update these
 *      }
 */
// export default function AlfaMenu(menuData, elementSelector, opts){
function AlfaMenu(menuData, elementSelector, opts){
    opts = opts || {};

    var defaults = {
        kidsMark: true,     // mark nmenu tree-branches
        levelIndent: 16,
        startClosed: true, // all subitems will be closed

        rightButtonsCallbacks: null, /* on menu header buttons can be defined */
       
        box_headerClass:  'alfa-collapsible-anim_header',
        box_contentClass: 'alfa-collapsible-anim_content',
        lastClickedClass: 'last-clicked',

        headerHoverCssBackground:  'background: lightblue !important;' /** overrides alfa-collapsible-anim-ui */
    };
    Object.assign(this, defaults, opts);

    this.elementSelector = elementSelector;
    this.menuContainerEl = $dqs(elementSelector);
    if(!this.menuContainerEl){logErr(elementSelector, 'not found!'); return}
    this.id = this.menuContainerEl.id;
    alfaConsoleLog.setCfg({id: this.id})
    

    this.menuLevels = {};
    this.menuItemsData = {};

    if(menuData){
        this.menuData = menuData;
        this.create();
    }
    log('constructor()', {menuData, opts})
 
    this.insertStyleTag()
    // this.menuIndex('next', '2'); // forDEBUG
}


AlfaMenu.prototype.load = function(menuData, opts){
    // log('load()', menuData, opts)

    this.menuData = []
    this.menuData = menuData;

    this.clearNode(this.menuContainerEl)
    this.create();
}

AlfaMenu.prototype.create = function(){  

    this.createMenuControls();
    var container = this.menuContainerEl;

    this.parseMenuArray(this.menuData, container,  '');

    // if (this.useKeyboardEvents){
    //     container.setAttribute('tabindex', 0);
    //     this.keyboardNavigation();
    // }

    this.lastUsedItem('get')
};


AlfaMenu.prototype.lastUsedItem = function(mode, itemIndex, section){

    var variableName = this.id.replace(/-/g, '_');
    variableName = 'last_menu_index_' + variableName;

    /** ALTERNATIVE 1: app storage
     * 
     *  NOTE:
     *  App may have multiple pages with menus belonging to a page
     */
    if(mode==='set'){
        this[variableName] = itemIndex;
        /* highlight this element as 'last-clicked'    */
        lastClicked.call(this);
    } else 
    if(mode==='get'){
        var lastUsed = this[variableName];
        if(lastUsed) {
            // TODO
            // this.selectItemById(lastUsed, {caller: 'lastUsedItem()'})
        }
        return lastUsed
    }

    /** ALTERNATIVE 2: session storage */

    // if(!this.id){logWarn('alfa-menu-ui element does not have unique ID', 'lastUsedItem will not be remembered!'); return; }
    // if(mode==='set'){
    //     sessionStorage.setItem(variableName, itemIndex);
    // } else 
    // if(mode==='get'){
    //     var lastUsed = sessionStorage.getItem(variableName);
    //     if(lastUsed) {this.selectItemById(lastUsed)}
    //     return lastUsed
    // }

    function lastClicked(){
        var lastClickedClass = this.lastClickedClass;
        /* 1. clear 'last-clicked' class from all   */
        var headers = this.menuContainerEl.querySelectorAll('.'+this.box_headerClass)
        headers.forEach( function(hdr){
            hdr.classList.remove(lastClickedClass);
        });
        /* 2. set 'last-clicked' class  */
        section.firstChild.classList.add(lastClickedClass);
    }
}

/** menu controls (buttons) are outside menu in element selected by containerSelector */
AlfaMenu.prototype.createMenuControls = function(){

    if (!this.controlsContainerSelector) return;

    /** CSS styling is done in insertStyleTag() */

    var controlContainer = $dqs(this.controlsContainerSelector);

    var aCloseAll = $dce('a');
    aCloseAll.setAttribute('href','#');
    aCloseAll.innerHTML='close all';
    aCloseAll.addEventListener('click', this.closeAll.bind(this)); 

    var aOpenAll = $dce('a');
    aOpenAll.setAttribute('href','#');
    aOpenAll.innerHTML='open all';
    aOpenAll.addEventListener('click', this.openAll.bind(this)); 

    // var controlContainer = $dqs(containerSelector);
    controlContainer.append(aCloseAll);
    controlContainer.append(aOpenAll);


};
AlfaMenu.prototype.closeAll = function(ev, opts){

    /** boxes = alfa-collapsible-anim-ui */
    var boxes = this.menuContainerEl.querySelectorAll('.'+this.box_contentClass)

    boxes.forEach(function(box){
        box.close.call(box, opts)
    })
};
AlfaMenu.prototype.openAll = function(ev, opts){
    var boxes = this.menuContainerEl.querySelectorAll('.'+this.box_contentClass)

    boxes.forEach(function(box){
        box.open(box, opts)
    })
};
/** returns menu item data {'menu text': payload} where payload can be an Object or Array*/
AlfaMenu.prototype.getItemData = function(itemIndex){
    return this.menuItemsData[itemIndex];
};
 
AlfaMenu.prototype.getItem =  function(itemIndex){
    var level = itemIndex.split('_').length;
    var itemData = this.menuItemsData[itemIndex];
    var text, payload;
    for (text in itemData){payload = itemData[text];}   
    return {text, payload, level};
};

AlfaMenu.prototype.findItemByText = function(text){

    var foundItems = []

    findItem(this.menuData)

    function findItem(itemsArr){
        itemsArr.forEach(function(item){
            /* is it leaf or branch? */
            var itemText = Object.keys(item)[0];
            if(Array.isArray(item[itemText])) {
                /* branch */
                findItem(item[itemText])
            } else {
                /* leaf */
                if(Object.keys(item)[0] === text){
                    foundItems.push(item)
                }
            }
        })
    }
    return foundItems;
    log(foundItems)
}

AlfaMenu.prototype.item_getText = function(item){
    return Object.keys(item)[0];
}
AlfaMenu.prototype.item_getPayload = function(item){
    var text = this.item_getText(item)
    return item[text]
}

/** finds menu item by text (first occurrence, if many items have the same text)
 *  @param {string} itemText
 *  @parem {Boolean} disable
 */
AlfaMenu.prototype.disableItem = function(itemText, disable){
    var foundItems = this.findItemByText(itemText)
    if( foundItems.length===0){logErr(`disableItem(${itemText}) item not found!`); return;}
    if( foundItems.length > 1){logWarn(`disableItem(${itemText}) many items found, only first will be disabled.`)}

   var item = foundItems[0]
   var itemPayload = this.item_getPayload(item)
   itemPayload.disabled = disable

   this.load(this.menuData)
}

AlfaMenu.prototype.parseMenuArray = function(mnuArr, container, idx){
    
    if(!mnuArr)               {logErr('parseMenuArray() menu array is falsy!'); return;}
    if(!Array.isArray(mnuArr)){logErr('parseMenuArray() menu array is not an Array!'); return;}
    if(mnuArr.length===0)     {logErr('parseMenuArray() menu array is empty!'); return;}

    mnuArr.forEach((item, i) => {
        
        var levNdx = gatherLevels.call(this, idx);
        this.createMenuItem(item, container, levNdx);

        function gatherLevels(I){

            var newIdx = I !=='' ? `${I}_${i+1}` : `${i+1}`; // item index
            var L = newIdx.split('_').length; // item level

            var lvl = this.menuLevels[L]; 
            if (lvl) {this.menuLevels[L].push(newIdx);} else {this.menuLevels[L] = [newIdx];}

            return {level: L, idx: newIdx};
        }
    }); 
};

AlfaMenu.prototype.createMenuItem = function(item, container, levNdx){

    var root = $dce('section');
        root.setAttribute('box-id', levNdx.idx);

        root.style.marginLeft = levNdx.level===1 ? 0 : `${this.levelIndent}px`; // `${this.levelIndent * (levNdx.level - 1)}px`;
    
    /*  alfa-collapsible-animated */
    var header = $dce('div');   header.classList.add( this.box_headerClass); 
    var content = $dce('div');  content.classList.add(this.box_contentClass);
   

    var mnuText = Object.keys(item)[0]; // displayed text
    var mnuValue= item[mnuText];     // link or submenu array

    if(mnuText===''){ /** create a spacer */
        var spacer = $dce('div')
        spacer.setAttribute('alfa-menu-spacer', '')
        container.append(spacer);
        return;     // ------------- >
    }

    if(mnuValue.disabled) {
        root.setAttribute('disabled','');
    }

    var subItemLen = 0, url='', urlText='', aTarget='', rightIcon='';
    if (Array.isArray(mnuValue)){
        subItemLen = mnuValue.length;
        this.parseMenuArray(mnuValue, content, levNdx.idx);
    } else {
        url = mnuValue.url || ''
        urlText = mnuValue.urlText || url
        aTarget = mnuValue.target
        rightIcon = mnuValue.rightIcon || '' // TODO
    }

    /** construct header:    */

    if (this.uriEncoding){
        try{ mnuText = decodeURIComponent(mnuText);} catch(err){logErr(mnuText, err);}
    }

    // make CSS rules for these classes
    var subitemsMarkClass = (subItemLen > 0) ? 'subitems-yes' : 'subitems-no'; 
    if (subItemLen > 0) root.setAttribute('has-subitems','');
    var itemrightIconClass = mnuValue.rightIcon || '';

    var aHref = url==='' ? '' : `<a href="${url}" ${aTarget ? 'target="'+aTarget+'"' : ''}>${urlText}</a>`;
    var icon = rightIcon==='' ? '' : `<i>${rightIcon}</i>`;


    /** buttons on the header elem, buttons and their events are defined outside in callback */
    var rightBtnsDiv

    var P = mnuText.indexOf('<use-btns cb="')
    if(P>-1){
        var cb =  mnuText.substring(P).match(/(?<=")[^"]+(?=")/)  //NOTE: ?<= may not be supported by all browsers    //this has surrounding quotes /".*?"/
        var rightBtnsDiv = this.rightButtonsCallbacks[cb]() // - returns html element with all btns having events assigned
    }

    header.innerHTML = `
        <code class="${subitemsMarkClass}"></code>
        <span class="text">${mnuText}</span>
        ${aHref}
        ${icon}
        `;

    if(rightBtnsDiv){
        header.append(rightBtnsDiv)
    }
    
    root.append(header);
    if(subItemLen > 0){ 
        /** menu item is tree-branch, create dropdwn */
        root.append(content); 
       
        var alfaCollapsibleAnim = new AlfaCollapsibleAnim(null, { 
            containerElement: root,
            startClosed: this.startClosed,
            // USELESS here: onHeaderClick: this.onItemClick
        })
    } else {
        /** menu item is tree-leaf */
        header.addEventListener('click', function(ev){

            if(ev) ev.stopImmediatePropagation();

            var section = ev.currentTarget.parentElement

            var itemIndex = section.getAttribute('box-id');
            this.lastUsedItem('set', itemIndex, section)

            var item = this.getItem(itemIndex);

            this.onItemClick(itemIndex, item, this.id) /** callback, executed outside */

        }.bind(this))
    }
    container.append(root);

  

    /** store menu item data for easy retrieval later by levelIndex stored in box-id     */
    this.menuItemsData[levNdx.idx] = item;

};

/** TODO 
 * opts.quiet = just expand, do not run */
AlfaMenu.prototype.selectItemById = function(boxId, opts){
    opts = opts || {};

    if(opts.caller) log(`selectItemById(${boxId}) caller: ${opts.caller}`);

    boxId = boxId.toString(); 
    var target = boxId;
    
    if (opts.nav){/*do nothing*/}else{ /* open subitems */

        // TODO
        this.menuCBoxes.closeAll();
        // this.closeAll(null, {noAnim: true})

        var steps = boxId.split('_');
        steps.forEach(function(s){
            
            // TODO
            this.menuCBoxes.openById(boxId, opts); // this will run menu command, unless is quiet

            boxId = boxId.substring(0, boxId.lastIndexOf('_'));
            // log('boxId', boxId);
        }.bind(this));
    }

    var el = $dqs(`section[box-id="${target}"]`);
    if(!el){logErr(`Menu item not found: box-id="${target}"`); return;}

    // TODO
    this.menuCBoxes.lastClicked(null, el); // el is <section>
};



/* ***********     keyboard handling    ********************************************** 

    on hosting page setup keyboard event handler:

        document.addEventListener('keydown', ev => {
            
            // 1. do something page specific like Esc, Backspace etc...    

            // 2. pass control to alfa-menu for Arrow, Enter and shortcut keys
            alfaMenu1.handleKeyboard(ev);
        });

*/

// event listener is on hosting page, first processes page specific keys and lastly passes control here:
AlfaMenu.prototype.handleKeyboard = function(ev){

    if(ev.key.startsWith('Arrow')){this.arrowKey(ev.key); return;} // handle Arrow keys
    if(ev.key==='Enter') {this.enterKey(ev); return;}

    if (ev.key.length > 1) return;   // evaluate only single keyboard characters as shortcuts:
    this.selectItemByShortcutKey(ev.key); // keys 1,2,3... A,B,C... as menu item shortcuts
};

// keys 1,2,3... A,B,C... as menu item shortcuts
AlfaMenu.prototype.selectItemByShortcutKey = function(key){

    key = key.toUpperCase();
    var keyAscii = key.charCodeAt(0);
    var id;
    if (keyAscii > 48 && keyAscii < 58) id = keyAscii - 48;   // numbers
    if (keyAscii > 64 && keyAscii < 91) id = keyAscii - 55;   // upper case letters
    if(id){id = id.toString();} else return;                  // other character, ignore

    
    var lastClicked = $dqs('section.last-clicked');

    var isOpened, newID;
    if (lastClicked){
        var opened = lastClicked.hasAttribute('opened'); // "opened" is from alfa-collapsible-boxes, it does not mean that menu item is open!!!
        var hasSubitems = lastClicked.hasAttribute('has-subitems');
        isOpened = opened && hasSubitems;

        if (isOpened) {
            var parentId = lastClicked.getAttribute('box-id');
            newID = `${parentId}_${id}`;
        } else {newID = id;}
    } else {
        newID = id;
    }

    this.selectItemById(newID, { caller:'selectItemByShortcutKey()'});
};

AlfaMenu.prototype.enterKey = function(ev){
    // ev.stopImmediatePropagation();

    var lastClicked = $dqs('section.last-clicked');
    if(lastClicked) {
        var boxID = lastClicked.getAttribute('box-id');
        this.menuCBoxes.toggleBox(boxID);
    }
};

AlfaMenu.prototype.arrowKey = function(direction){

    var lastClicked = $dqs('section.last-clicked');
    var currIndex = lastClicked ? lastClicked.getAttribute('box-id') : '0'; // box-id contains menu index string
    
    var opened = lastClicked && lastClicked.hasAttribute('opened'); // "opened" is from alfa-collapsible-boxes, it does not mean that menu item is open!!!
    var hasSubitems = lastClicked && lastClicked.hasAttribute('has-subitems');
    var isOpened = opened && hasSubitems;

    var newIndex;
   
    switch (direction){
        case 'ArrowDown': 
            if (isOpened) newIndex = this.menuIndex_getFirstChild(currIndex);
            else          newIndex = this.menuIndex('next', currIndex); 
            break;
        case 'ArrowUp': 
            if(currIndex.endsWith('_1')){newIndex = currIndex.slice(0, -2);}
            else                         newIndex = this.menuIndex('prev', currIndex); 
            break;
    }
    if(newIndex) this.selectItemById(newIndex, {quiet: true, nav: true, caller:'arrowKey()'});

};

AlfaMenu.prototype.menuIndex_getFirstChild = function(parentIndex){

    var newIndex = parentIndex+'_1';
    // find if newly created menu index exists
    var level = newIndex.split('_').length; // item level
    var found = this.menuLevels[level].find(function(item){
        return item===newIndex;
    });
    return found ? newIndex : null;
};

AlfaMenu.prototype.menuIndex = function(direction, indexStr){

    var level = indexStr.split('_').length; // item level

    var P = indexStr.lastIndexOf('_');
    var lastIndex = indexStr.substring(P+1);
    lastIndex = parseInt(lastIndex, 10);
    if(direction==='next') lastIndex++; else lastIndex--;

    var parent = indexStr.substring(0, P+1);

    var newIndex = `${parent}${lastIndex}`;

    // find if newly created menu index exists
    var found = this.menuLevels[level].find(function(item){
        return item===newIndex;
    });

    return found ? newIndex : null;
};


AlfaMenu.prototype.clearNode = function(myNode){
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
}

/** 
 *  most of styling is done in alfa-collapsible-boxes
 */
AlfaMenu.prototype.insertStyleTag = function(){
    
    var styleAttr = 'alfa-menu-ui'+'_'+this.id;
    
    if($dqs(`[${styleAttr}]`)) return;  /** do not insert style if already exists */

    var styleTag = $dce('style');
    styleTag.setAttribute(styleAttr, '');

    var sel = this.elementSelector;
    var box_headerClass = this.box_headerClass
    var box_contentClass = this.box_contentClass
    var lastClickedClass = this.lastClickedClass

    var bottomBorderColor = 'gainsboro'

    /** alfa-collapsible-anim-ui CSS is overridden here using !important */

    styleTag.innerHTML = `
    
        ${sel} .${box_headerClass} {
            cursor: pointer;
            background: unset !important; 
            border-bottom: 1px solid ${bottomBorderColor}; 
            margin-bottom: 1px;
        }
        ${sel} .${box_headerClass}:hover{
            ${this.headerHoverCssBackground}
        }
       
        ${sel} [alfa-menu-spacer] {height: .1em; background: ${bottomBorderColor}; margin-top: -1px;}
        ${sel} section[disabled] {color: grey}
        ${sel} .${lastClickedClass} {
            background: orange !important;  /* does not work with themes   --alfa-drawer-menu-row-selected */
        }
        `; 

        // ${sel} .${lastClickedClass} > .${box_headerClass}{
        //     background: orange !important;
        // }

    

    if(this.kidsMark){
        styleTag.innerHTML +=`
        ${sel} .${box_headerClass} .subitems-yes:after, 
        ${sel} .${box_headerClass} .subitems-no:after {color: silver; font-weight:bold;}

        ${sel} .${box_headerClass} .subitems-yes:after{content:'+'}
        ${sel} .${box_headerClass} .subitems-no:after {content:'-'; color: transparent}
    `;
        }

    if (this.controlsContainerSelector){
        var ctr = this.controlsContainerSelector;
        styleTag.innerHTML +=`
        
        ${ctr} {margin: 0 0 3px 0;}
        ${ctr} a {
            border: 1px solid silver; 
            padding: 0 5px; 
            margin: 0 3px 0 0; 
            font-size: .8em;
            text-decoration: none;
            }
        ${ctr} a:hover{ border-bottom: 1px solid blue}

        `;
    }

    /* NOTE: calling body.append will add your new styles to the bottom of the page and override any existing ones */
    $dqs('head').append(styleTag);
}

export default AlfaMenu