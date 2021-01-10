/*! Copyright (c) 2020 alfalabs.net license MIT */
/* NEW
 * usage:

    import AlfaConsoleLog from './alfa-console-log.mjs'; 
    var alfaConsoleLog = new AlfaConsoleLog('module_name', {logLevel: 5}) 
    var log =     alfaConsoleLog.log.bind(alfaConsoleLog)
    var logInfo = alfaConsoleLog.logInfo.bind(alfaConsoleLog)
    var logWarn = alfaConsoleLog.logWarn.bind(alfaConsoleLog)
    var logErr =  alfaConsoleLog.logErr.bind(alfaConsoleLog)

 * in constructor: is this needed ???, setting options in new AlfaConsoleLog() works

    // alfaConsoleLog.setCfg({
    //     id: - html element id
    //     color:
    //     infoColor:
    //     logLevel: OPTIONAL, default=2 shows errors and wranings, default can be globally overriden in LocalStorage using Key: alfa-console-log_level
    //               0 - nothing, 
    //               1 - errors only, 
    //               2 - errors and warnings, 
    //               3 - errors, warnings and info
    //               4 - all
    //               can be set for development in localStorage 'alfa-console-log_level'
    //               NOTE: ElectronJS does not have localStorage
    // })

*   debugging specific module:

    set Local Storage Key:
    alfa-console-log_level_MODULE-NAME = 4 to show all

    follow naming convention:
    'alfa-console-log_level_' + moduleName

*/

function AlfaConsoleLog (moduleName, opts){

    opts = opts || {}
    var defaults = {
        color: 'black',
        logLevel: this.setLogLevel(moduleName) || 5, 
    }
    this.cfg = Object.assign(defaults, opts)
    this.cfg.moduleName = moduleName
}

AlfaConsoleLog.prototype.setCfg = function (cfg){
    this.cfg = Object.assign(this.cfg, cfg)
}

AlfaConsoleLog.prototype.log = function log(){
    if(this.cfg.logLevel < 4) return;
    var args = Array.prototype.slice.call(arguments); // not working in strict mode? but works here
    args.unshift(`%c${this.getModuleName()}`, `color:${this.cfg.color}`);
    console.log.apply(null, args);
}
AlfaConsoleLog.prototype.logInfo = function logWarn(){ /** colorize moduleName and first item  */
    if(this.cfg.logLevel < 3) return;
    var args = Array.prototype.slice.call(arguments); 
    args = this.formatInfoArgs(args)
    console.log.apply(null, args);
}
AlfaConsoleLog.prototype.logWarn = function logWarn(){
    if(this.cfg.logLevel < 2) return;
    var args = Array.prototype.slice.call(arguments); 
    args.unshift(`%c${this.getModuleName()} WARNING:`, 'color:orange; font-weight: bold;');
    console.log.apply(null, args);
}
AlfaConsoleLog.prototype.logErr = function logErr(){
    if(this.cfg.logLevel===0) return;
    var args = Array.prototype.slice.call(arguments); 
    args.unshift(`%c${this.getModuleName()} ERR:`, 'color:red; font-weight: bold;');
    console.log.apply(null, args);
}

/** colorize moduleName and first item  */
AlfaConsoleLog.prototype.formatInfoArgs = function(args){
    var infoColor = this.cfg.infoColor || 'blue';
    var css = this.css ? this.css : `color: ${infoColor};`;
    var arg1 = args.shift(); 

    switch(this.cfg.moduleName){
        case 'collect-trans': /* format specific for MSC Transaction  */
            // var css = this.css ? this.css : `color: ${infoColor};`;
            if(arg1.startsWith('<E')) {css +='background: #ffd9d6;'}
    }
    
    args.unshift(`%c${this.getModuleName()} ${arg1}`, css); 
    return args
}


// AlfaConsoleLog.prototype.logColor = function(){ // colorize prefix and first item
//     if(this.cfg.logLevel < 3) return; // like logInfo
//     var css = this.css ? this.css : `color: ${this.cfg.color};`;
//     var args = Array.prototype.slice.call(arguments);
//     var arg1 = args.shift(); 
   
//     args.unshift(`%c${this.getModuleName()} ${arg1}`, css); 
//     console.log.apply(null, args);       
// };

AlfaConsoleLog.prototype.getModuleName = function getModuleName(){
    var id = this.cfg.id ? '#'+this.cfg.id : ''
    return `[${this.cfg.moduleName}]${id}`
}
AlfaConsoleLog.prototype.setLogLevel = function(moduleName){

    /** check if ElektronJS is using this */
    if(typeof loaclStorage ==='undefined') return;

    /** override for specific module */
    var module_level = localStorage.getItem('alfa-console-log_level_'+ moduleName)
    if(module_level) return module_level; // --- >

    /** global override for all modules */
    return localStorage.getItem('alfa-console-log_level')
}

export default AlfaConsoleLog

