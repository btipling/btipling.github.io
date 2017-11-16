"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = require("@cycle/run");
const dom_1 = require("@cycle/dom");
function main(sources) {
    const vdom$ = sources.DOM
        .select('.myinput').events('input')
        .map(ev => ev.target.value)
        .startWith('')
        .map(name => dom_1.div([
        dom_1.label('Name:'),
        dom_1.input('.myinput', {
            attrs: {
                type: 'text'
            }
        }),
        dom_1.hr(),
        dom_1.h1(`Hello ${name}`)
    ]));
    return {
        DOM: vdom$,
    };
}
run_1.run(main, {
    DOM: dom_1.makeDOMDriver('#main-container')
});
//# sourceMappingURL=main.js.map