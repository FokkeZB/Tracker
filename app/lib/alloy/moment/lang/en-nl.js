//! moment.js locale configuration
//! locale : great britain english (en-gb)
//! author : Chris Gedrim : https://github.com/chrisgedrim

(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('alloy/moment')) :
   typeof define === 'function' && define.amd ? define(['moment'], factory) :
   factory(global.moment)
}(this, function (moment) { 'use strict';


    var en_nl = moment.defineLocale("en-nl", {
        longDateFormat: {
            LT: "HH:mm",
            LTS: "HH:mm:ss",
            L: "MM/DD/YYYY",
            LL: "MMMM D, YYYY",
            LLL: "MMMM D, YYYY HH:mm",
            LLLL: "dddd, MMMM D, YYYY HH:mm"
        },
    });

    return en_nl;

}));