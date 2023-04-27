
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var realbook = `data:font/ttf;base64,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ADAAMAA4ACwAIABpAG4AaQB0AGkAYQBsACAAcgBlAGwAZQBhAHMAZQBQAGUAYQBNAGkAcwBzAHkAdwBpAHQAaABhAE0AYQByAGsAZQByAFQAaABpAHMAIABmAG8AbgB0ACAAdwBhAHMAIABjAHIAZQBhAHQAZQBkACAAdQBzAGkAbgBnACAARgBvAG4AdAAgAEMAcgBlAGEAdABvAHIAIAA1AC4AMAAgAGYAcgBvAG0AIABIAGkAZwBoAC0ATABvAGcAaQBjAC4AYwBvAG0AaAB0AHQAcAA6AC8ALwB3AHcAdwAuAGsAZQB2AGkAbgBhAG4AZABhAG0AYQBuAGQAYQAuAGMAbwBtAC8AZgBvAG4AdABzAC8ATgBvAHIAbQBhAGEAbABpAE4AbwByAG0AYQBsAGUAUwB0AGEAbgBkAGEAYQByAGQATgBvAHIAbQBhAGwAbgB5BB4EMQRLBEcEPQRLBDkATgBvAHIAbQDhAGwAbgBlAE4AYQB2AGEAZABuAG8AQQByAHIAdQBuAHQAYQACAAAAAAAA/ycAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAAECAQMAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAIMAtAC1ALYAtwUubnVsbBBub25tYXJraW5ncmV0dXJuAAAAAAAAAf//AAI=`;

    /* src/Chord.svelte generated by Svelte v3.47.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/Chord.svelte";

    // (24:2) {#if name}
    function create_if_block$1(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(h2, "class", "svelte-eypcwm");
    			add_location(h2, file$2, 23, 12, 594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(24:2) {#if name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let t;
    	let div1;
    	let div0;
    	let if_block = /*name*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "chord-diagram");
    			add_location(div0, file$2, 24, 20, 635);
    			attr_dev(div1, "class", "cont");
    			add_location(div1, file$2, 24, 2, 617);
    			attr_dev(div2, "class", "chord svelte-eypcwm");
    			add_location(div2, file$2, 22, 0, 562);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[6](div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*name*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			/*div0_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chord', slots, []);
    	let { fingers = null } = $$props;
    	let { frets = null } = $$props;
    	let { shift = null } = $$props;
    	let { name = null } = $$props;
    	let { scale = 1 } = $$props;
    	let element;

    	onMount(() => {
    		element.style.setProperty(`--scale`, scale.toString());
    		$$invalidate(2, frets = frets.map(i => i < 0 ? i : i + (shift || 0)));
    		console.log(window.chordDiagram, { frets });

    		try {
    			$$invalidate(1, element.innerHTML = window.chordDiagram.build_diagram(frets, fingers ? fingers : undefined).innerHTML, element);
    		} catch(e) {
    			
    		}
    	});

    	const writable_props = ['fingers', 'frets', 'shift', 'name', 'scale'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Chord> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('fingers' in $$props) $$invalidate(3, fingers = $$props.fingers);
    		if ('frets' in $$props) $$invalidate(2, frets = $$props.frets);
    		if ('shift' in $$props) $$invalidate(4, shift = $$props.shift);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('scale' in $$props) $$invalidate(5, scale = $$props.scale);
    	};

    	$$self.$capture_state = () => ({
    		fingers,
    		frets,
    		shift,
    		name,
    		scale,
    		onMount,
    		element
    	});

    	$$self.$inject_state = $$props => {
    		if ('fingers' in $$props) $$invalidate(3, fingers = $$props.fingers);
    		if ('frets' in $$props) $$invalidate(2, frets = $$props.frets);
    		if ('shift' in $$props) $$invalidate(4, shift = $$props.shift);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('scale' in $$props) $$invalidate(5, scale = $$props.scale);
    		if ('element' in $$props) $$invalidate(1, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, element, frets, fingers, shift, scale, div0_binding];
    }

    class Chord extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			fingers: 3,
    			frets: 2,
    			shift: 4,
    			name: 0,
    			scale: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chord",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get fingers() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fingers(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frets() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frets(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shift() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shift(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/chordjs.svelte generated by Svelte v3.47.0 */

    const file$1 = "src/chordjs.svelte";

    function create_fragment$1(ctx) {
    	let style0;
    	let style1;
    	let style2;
    	let script;

    	const block = {
    		c: function create() {
    			style0 = element("style");
    			style0.textContent = ".github-corner:hover .octo-arm {\n      animation: octocat-wave 560ms ease-in-out;\n    }\n    .github-corner {\n      display: block;\n      z-index: 100000;\n      cursor: pointer;\n      border: 1px solid;\n      position: absolute;\n      top: 0;\n      right: 0;\n    }\n    @media print {\n      .github-corner {\n        display: none !important;\n      }\n    }\n    @keyframes octocat-wave {\n      0%,\n      100% {\n        transform: rotate(0);\n      }\n      20%,\n      60% {\n        transform: rotate(-25deg);\n      }\n      40%,\n      80% {\n        transform: rotate(10deg);\n      }\n    }\n    @media (max-width: 500px) {\n      .github-corner:hover .octo-arm {\n        animation: none;\n      }\n      .github-corner .octo-arm {\n        animation: octocat-wave 560ms ease-in-out;\n      }\n    }\n  ";
    			style1 = element("style");
    			style1.textContent = ".coolbutton {\n      appearance: none;\n      background-color: #fff;\n      border: 2px solid #333;\n      box-sizing: border-box;\n      color: #000;\n      cursor: pointer;\n      display: inline-block;\n      font-size: 14px;\n      font-weight: 500;\n      letter-spacing: 0;\n      line-height: 1em;\n      margin: 0;\n      opacity: 1;\n      outline: 0;\n      padding: 1.5em 2.2em;\n      position: relative;\n      text-align: center;\n      text-decoration: none;\n      text-rendering: geometricprecision;\n      text-transform: uppercase;\n      transition: opacity 300ms cubic-bezier(0.694, 0, 0.335, 1),\n        background-color 100ms cubic-bezier(0.694, 0, 0.335, 1),\n        color 100ms cubic-bezier(0.694, 0, 0.335, 1),\n        border-color 500ms cubic-bezier(0.694, 0, 0.335, 1);\n      user-select: none;\n      -webkit-user-select: none;\n      touch-action: manipulation;\n      vertical-align: baseline;\n      white-space: nowrap;\n    }\n\n    .coolbutton:before {\n      animation: opacityFallbackOut 0.5s step-end forwards;\n      backface-visibility: hidden;\n      background-color: #ebebeb;\n      clip-path: polygon(-1% 0, 0 0, -25% 100%, -1% 100%);\n      content: \"\";\n      height: 100%;\n      left: 0;\n      position: absolute;\n      top: 0;\n      transform: translateZ(0);\n      transition: clip-path 0.5s cubic-bezier(0.165, 0.84, 0.44, 1),\n        -webkit-clip-path 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);\n      width: 100%;\n    }\n\n    .coolbutton:hover:before {\n      animation: opacityFallbackIn 0s step-start forwards;\n      clip-path: polygon(0 0, 101% 0, 101% 101%, 0 101%);\n    }\n\n    .coolbutton:after {\n      background-color: #fff;\n    }\n\n    .coolbutton span {\n      z-index: 1;\n      position: relative;\n    }\n\n    .coolbutton:hover {\n      border-color: transparent;\n    }\n  ";
    			style2 = element("style");
    			style2.textContent = "div.chord-diagram {\n      overflow: hidden;\n      display: inline-block;\n    }\n\n    div.chord-diagram > div.header {\n      float: left;\n      clear: left;\n      margin-left: -1px;\n    }\n\n    div.chord-diagram > div.header > div {\n      position: relative;\n      font-family: arial;\n      font-size: 13px;\n      line-height: 7px;\n      text-align: center;\n      width: 9px;\n      height: 9px;\n      float: left;\n    }\n\n    div.chord-diagram > div.header > div > div {\n      position: absolute;\n      top: 0;\n      left: 1px;\n      width: 5px;\n      height: 5px;\n      border-radius: 50%;\n      border: 1px solid #000;\n      background: #fff;\n    }\n\n    div.chord-diagram > div.row {\n      margin-left: 3px;\n      float: left;\n      clear: both;\n    }\n\n    div.chord-diagram > div.row > div {\n      position: relative;\n      width: 8px;\n      height: 9px;\n      border: solid #000;\n      border-width: 1px 0 0 1px;\n      float: left;\n    }\n\n    div.chord-diagram > div.row > div:last-child {\n      border-width: 1px 1px 0;\n    }\n\n    div.chord-diagram > div.header + div:not(.first) {\n      margin-top: 3px;\n    }\n\n    div.chord-diagram > div.row.first:first-child {\n      margin-top: 9px;\n    }\n\n    div.chord-diagram > div.row.first > div {\n      border-width: 4px 0 0 1px;\n    }\n\n    div.chord-diagram > div.row.first > div:last-child {\n      border-width: 4px 1px 0;\n    }\n\n    div.chord-diagram > div.row.last > div {\n      border-width: 1px 0 1px 1px;\n    }\n\n    div.chord-diagram > div.row.last > div:last-child {\n      border-width: 1px;\n    }\n\n    div.chord-diagram > div.row > div > div.barre {\n      position: absolute;\n      top: 2px;\n      left: -3px;\n      width: 12px;\n      height: 3px;\n      border-radius: 2px;\n      border: 1px solid #000;\n      background: #aaa;\n      z-index: 1;\n    }\n\n    div.chord-diagram > div.row > div > div.barre.barre-1 {\n      width: 12px;\n    }\n\n    div.chord-diagram > div.row > div > div.barre.barre-2 {\n      width: 21px;\n    }\n\n    div.chord-diagram > div.row > div > div.barre.barre-3 {\n      width: 30px;\n    }\n\n    div.chord-diagram > div.row > div > div.barre.barre-4 {\n      width: 39px;\n    }\n\n    div.chord-diagram > div.row > div > div.barre.barre-5 {\n      width: 48px;\n    }\n\n    div.chord-diagram > div.row > div > div.knob {\n      position: absolute;\n      top: 1px;\n      left: -4px;\n      width: 5px;\n      height: 5px;\n      border-radius: 50%;\n      border: 1px solid #000;\n      background: #aaa;\n      z-index: 1;\n    }\n\n    div.chord-diagram > div.row > div > div.knob.right {\n      left: 5px;\n    }\n\n    div.chord-diagram > div.row > div.fretno {\n      height: 10px;\n      width: auto;\n      border-width: 0 0 0 1px;\n      padding-left: 4px;\n      line-height: 12px;\n      font-family: arial;\n      font-size: 12px;\n    }\n\n    div.chord-diagram > div.footer {\n      float: left;\n      clear: left;\n      margin-left: -2px;\n    }\n\n    div.chord-diagram > div.footer > div {\n      position: relative;\n      font-family: arial;\n      font-size: 10px;\n      text-align: center;\n      width: 9px;\n      min-height: 11px;\n      float: left;\n    }\n  ";
    			script = element("script");
    			script.textContent = "var chordDiagram = (function () {\n      \"use strict\";\n      var e,\n        t = {},\n        r = document.createElement(\"div\"),\n        n = document.createElement(\"div\"),\n        a = document.createElement(\"div\");\n      function i(t, r, n) {\n        if (\"object\" != typeof t) return !1;\n        for (e = 0; e < r; e += 1)\n          if (\"number\" != typeof t[e] || t[e] % 1 != 0 || t[e] < -1 || t[e] > n)\n            return !1;\n        return !0;\n      }\n      return (\n        n.appendChild(document.createElement(\"div\")),\n        (a.innerHTML = \"&times;\"),\n        (t.build_diagram = function (t, d) {\n          var o,\n            c,\n            l,\n            m,\n            f,\n            u,\n            s,\n            p,\n            h,\n            v,\n            g,\n            b = t.length,\n            E = !1,\n            C = 100,\n            N = 0;\n          if (!i(t, b, 32)) throw \"Frets parameter format is invalid\";\n          if (void 0 !== d && !i(d, b, 4))\n            throw \"Fingers parameter format is invalid\";\n          for (e = 0; e < b; e += 1)\n            t[e] > -1 && t[e] > N && (N = t[e]),\n              t[e] > 0 && t[e] < C && (C = t[e]),\n              \"object\" == typeof d && -1 !== d[e] && (E = !0);\n          for (\n            (o = document.createElement(\"div\")).className = \"chord-diagram\",\n              o.appendChild(\n                (function (t) {\n                  var i,\n                    d = document.createElement(\"div\"),\n                    o = t.length;\n                  for (d.className = \"header\", e = 0; e < o; e += 1)\n                    (i = 0 === t[e] ? n : -1 === t[e] ? a : r),\n                      d.appendChild(i.cloneNode(!0));\n                  return d;\n                })(t)\n              ),\n              l = c = N > 5 ? C : 1;\n            l < c + 5;\n            l += 1\n          ) {\n            if (\n              (((m = document.createElement(\"div\")).className =\n                1 === l ? \"row first\" : l === c + 4 ? \"row last\" : \"row\"),\n              (s = -1),\n              (p = -1),\n              (h = -1),\n              E)\n            ) {\n              for (e = 0; e < b; e += 1) {\n                if (-1 !== s)\n                  if (t[e] === l && d[e] === h) p = e;\n                  else if (t[e] < l || (t[e] === l && d[e] !== h)) {\n                    if (-1 !== p) break;\n                    s = -1;\n                  }\n                -1 === s && -1 !== d[e] && t[e] === l && ((s = e), (h = d[e]));\n              }\n              p <= s && (s = -1);\n            }\n            for (e = 0; e < b - 1; e += 1)\n              (f = document.createElement(\"div\")),\n                e === s\n                  ? (((v = document.createElement(\"div\")).className =\n                      \"barre barre-\" + (p - s)),\n                    f.appendChild(v))\n                  : (e < s || e >= p) &&\n                    (e !== p &&\n                      t[e] === l &&\n                      (((g = document.createElement(\"div\")).className = \"knob\"),\n                      f.appendChild(g)),\n                    e === b - 2 &&\n                      t[b - 1] === l &&\n                      (((g = document.createElement(\"div\")).className =\n                        \"knob right\"),\n                      f.appendChild(g))),\n                m.appendChild(f);\n            l === c &&\n              1 !== l &&\n              (((u = document.createElement(\"div\")).className = \"fretno\"),\n              (u.innerHTML = l),\n              m.appendChild(u)),\n              o.appendChild(m);\n          }\n          return (\n            E &&\n              o.appendChild(\n                (function (t, r) {\n                  var n,\n                    a = document.createElement(\"div\"),\n                    i = r.length;\n                  for (a.className = \"footer\", e = 0; e < i; e += 1)\n                    (n = document.createElement(\"div\")),\n                      t[e] > 0 &&\n                        (0 === r[e]\n                          ? (n.innerHTML = \"T\")\n                          : r[e] > 0 && (n.innerHTML = r[e])),\n                      a.appendChild(n);\n                  return a;\n                })(t, d)\n              ),\n            o\n          );\n        }),\n        (t.on_load = function () {\n          return t.replace_tags();\n        }),\n        (t.replace_tags = function (r, n, a) {\n          void 0 === r && (r = document.body),\n            void 0 === n && (n = \"chord-diagram\"),\n            void 0 === a && (a = \"div\");\n          var i,\n            d,\n            o,\n            c,\n            l,\n            m,\n            f,\n            u,\n            s,\n            p,\n            h,\n            v,\n            g = r.getElementsByClassName(n);\n          for (d = g.length, i = 0; i < d; i += 1)\n            if (\n              \"object\" == typeof (o = g[i]) &&\n              (m = o.getAttribute(\"data-frets\"))\n            ) {\n              for (\n                c = +o.getAttribute(\"data-shift\"), f = m.length, l = [], e = 0;\n                e < f;\n                e += 1\n              )\n                (u = m.charAt(e).toLowerCase()),\n                  (l[e] = \"x\" === u ? -1 : +u + c);\n              if ((p = o.getAttribute(\"data-fingers\")) && f <= p.length) {\n                for (s = [], e = 0; e < f; e += 1)\n                  (h = p.charAt(e).toLowerCase()), (s[e] = \"x\" === h ? -1 : +h);\n                v = t.build_diagram(l, s);\n              } else v = t.build_diagram(l);\n              o.innerHTML = v.innerHTML;\n            }\n        }),\n        t\n      );\n    })();";
    			add_location(style0, file$1, 1, 2, 16);
    			add_location(style1, file$1, 43, 2, 826);
    			add_location(style2, file$1, 110, 2, 2640);
    			add_location(script, file$1, 261, 2, 5776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, style0);
    			append_dev(document.head, style1);
    			append_dev(document.head, style2);
    			append_dev(document.head, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(style0);
    			detach_dev(style1);
    			detach_dev(style2);
    			detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chordjs', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chordjs> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Chordjs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chordjs",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (166:8) {:else}
    function create_else_block(ctx) {
    	let input;
    	let input_value_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.readOnly = true;
    			input.value = input_value_value = "" + (/*title*/ ctx[3] + " (page " + (/*group_idx*/ ctx[13] + 1) + ")");
    			attr_dev(input, "class", "svelte-97j2sr");
    			add_location(input, file, 166, 10, 5132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 8 && input_value_value !== (input_value_value = "" + (/*title*/ ctx[3] + " (page " + (/*group_idx*/ ctx[13] + 1) + ")")) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(166:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (163:8) {#if group_idx === 0}
    function create_if_block_2(ctx) {
    	let input;
    	let t0;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Click the title to edit";
    			attr_dev(input, "class", "svelte-97j2sr");
    			add_location(input, file, 163, 10, 5010);
    			attr_dev(span, "class", "description svelte-97j2sr");
    			add_location(span, file, 164, 10, 5049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*title*/ ctx[3]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 8 && input.value !== /*title*/ ctx[3]) {
    				set_input_value(input, /*title*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(163:8) {#if group_idx === 0}",
    		ctx
    	});

    	return block;
    }

    // (179:45) 
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "empty");
    			add_location(div, file, 179, 14, 5640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(179:45) ",
    		ctx
    	});

    	return block;
    }

    // (171:12) {#if !chord.type || chord.type !== "chord"}
    function create_if_block(ctx) {
    	let previous_key = JSON.stringify(/*chord*/ ctx[14]);
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*chords*/ 16 && safe_not_equal(previous_key, previous_key = JSON.stringify(/*chord*/ ctx[14]))) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(171:12) {#if !chord.type || chord.type !== \\\"chord\\\"}",
    		ctx
    	});

    	return block;
    }

    // (172:14) {#key JSON.stringify(chord)}
    function create_key_block(ctx) {
    	let chord;
    	let current;

    	chord = new Chord({
    			props: {
    				scale: 0.5,
    				name: /*chord*/ ctx[14].name,
    				frets: /*chord*/ ctx[14].frets,
    				shift: /*chord*/ ctx[14].shift,
    				fingers: /*chord*/ ctx[14].fingers
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chord.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chord, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chord_changes = {};
    			if (dirty & /*chords*/ 16) chord_changes.name = /*chord*/ ctx[14].name;
    			if (dirty & /*chords*/ 16) chord_changes.frets = /*chord*/ ctx[14].frets;
    			if (dirty & /*chords*/ 16) chord_changes.shift = /*chord*/ ctx[14].shift;
    			if (dirty & /*chords*/ 16) chord_changes.fingers = /*chord*/ ctx[14].fingers;
    			chord.$set(chord_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chord.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chord.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chord, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(172:14) {#key JSON.stringify(chord)}",
    		ctx
    	});

    	return block;
    }

    // (170:10) {#each group as chord}
    function create_each_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*chord*/ ctx[14].type || /*chord*/ ctx[14].type !== "chord") return 0;
    		if (/*chord*/ ctx[14].type === "empty") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(170:10) {#each group as chord}",
    		ctx
    	});

    	return block;
    }

    // (161:4) {#each group(36, chords) as group, group_idx}
    function create_each_block(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*group_idx*/ ctx[13] === 0) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*group*/ ctx[11];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(div0, "class", "chords svelte-97j2sr");
    			add_location(div0, file, 168, 8, 5212);
    			attr_dev(div1, "class", "group svelte-97j2sr");
    			add_location(div1, file, 161, 6, 4950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);

    			if (dirty & /*JSON, group, chords*/ 2064) {
    				each_value_1 = /*group*/ ctx[11];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(161:4) {#each group(36, chords) as group, group_idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let chordjs;
    	let t0;
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let t1;
    	let div3;
    	let div0;
    	let t2;
    	let span0;
    	let t4;
    	let div1;
    	let h2;
    	let t6;
    	let span1;
    	let t8;
    	let label;
    	let input;
    	let t9;
    	let t10;
    	let textarea;
    	let t11;
    	let button;
    	let span2;
    	let t13;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;
    	chordjs = new Chordjs({ $$inline: true });
    	let each_value = group(36, /*chords*/ ctx[4]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(chordjs.$$.fragment);
    			t0 = space();
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			t2 = text("Printing...\n    ");
    			span0 = element("span");
    			span0.textContent = "I'm done printing";
    			t4 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Enter some chords";
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Use one line per chord. The first section is the chord name, the second\n      section is the frets (you can also separate by commas for higher frets),\n      the third segment is fingering, and the 4th segment is the displayed\n      shift.";
    			t8 = space();
    			label = element("label");
    			input = element("input");
    			t9 = text(" Use real book font");
    			t10 = space();
    			textarea = element("textarea");
    			t11 = space();
    			button = element("button");
    			span2 = element("span");
    			span2.textContent = "Print";
    			t13 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path0, "d", "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z");
    			add_location(path0, file, 121, 5, 3004);
    			attr_dev(path1, "d", "M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2");
    			attr_dev(path1, "fill", "currentColor");
    			set_style(path1, "transform-origin", "130px 106px");
    			attr_dev(path1, "class", "octo-arm");
    			add_location(path1, file, 121, 67, 3066);
    			attr_dev(path2, "d", "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "class", "octo-body");
    			add_location(path2, file, 126, 6, 3367);
    			attr_dev(svg, "width", "80");
    			attr_dev(svg, "height", "80");
    			attr_dev(svg, "viewBox", "0 0 250 250");
    			set_style(svg, "fill", "#64CEAA");
    			set_style(svg, "color", "#fff");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "top", "0");
    			set_style(svg, "border", "0");
    			set_style(svg, "right", "0");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file, 115, 3, 2827);
    			attr_dev(a, "href", "https://github.com/explosion-scratch/chartz");
    			attr_dev(a, "class", "github-corner");
    			attr_dev(a, "aria-label", "View source on GitHub");
    			add_location(a, file, 111, 0, 2707);
    			attr_dev(span0, "class", "cancel svelte-97j2sr");
    			add_location(span0, file, 136, 4, 4099);
    			attr_dev(div0, "class", "mask svelte-97j2sr");
    			add_location(div0, file, 134, 2, 4060);
    			attr_dev(h2, "class", "svelte-97j2sr");
    			add_location(h2, file, 141, 4, 4227);
    			attr_dev(span1, "class", "desc svelte-97j2sr");
    			add_location(span1, file, 142, 4, 4258);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-97j2sr");
    			add_location(input, file, 149, 6, 4553);
    			attr_dev(label, "class", "svelte-97j2sr");
    			add_location(label, file, 148, 4, 4539);
    			attr_dev(textarea, "class", "svelte-97j2sr");
    			add_location(textarea, file, 151, 4, 4638);
    			attr_dev(span2, "class", "text");
    			add_location(span2, file, 156, 6, 4817);
    			attr_dev(button, "class", "coolbutton svelte-97j2sr");
    			add_location(button, file, 152, 4, 4694);
    			attr_dev(div1, "class", "left svelte-97j2sr");
    			add_location(div1, file, 140, 2, 4204);
    			attr_dev(div2, "class", "right svelte-97j2sr");
    			add_location(div2, file, 159, 2, 4874);
    			attr_dev(div3, "class", "container svelte-97j2sr");
    			toggle_class(div3, "print", /*printing*/ ctx[2]);
    			toggle_class(div3, "realbook", /*useFont*/ ctx[1]);
    			add_location(div3, file, 133, 0, 3986);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(chordjs, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t2);
    			append_dev(div0, span0);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t6);
    			append_dev(div1, span1);
    			append_dev(div1, t8);
    			append_dev(div1, label);
    			append_dev(label, input);
    			input.checked = /*useFont*/ ctx[1];
    			append_dev(label, t9);
    			append_dev(div1, t10);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*chordtext*/ ctx[0]);
    			append_dev(div1, t11);
    			append_dev(div1, button);
    			append_dev(button, span2);
    			append_dev(div3, t13);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[7]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
    					listen_dev(textarea, "keyup", /*save*/ ctx[5], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*useFont*/ 2) {
    				input.checked = /*useFont*/ ctx[1];
    			}

    			if (dirty & /*chordtext*/ 1) {
    				set_input_value(textarea, /*chordtext*/ ctx[0]);
    			}

    			if (dirty & /*group, chords, JSON, title*/ 2072) {
    				each_value = group(36, /*chords*/ ctx[4]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*printing*/ 4) {
    				toggle_class(div3, "print", /*printing*/ ctx[2]);
    			}

    			if (dirty & /*useFont*/ 2) {
    				toggle_class(div3, "realbook", /*useFont*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chordjs.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chordjs.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chordjs, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function group(num, array) {
    	const group = [];

    	for (let i = 0; i < array.length; i += num) {
    		group.push(array.slice(i, i + num));
    	}

    	return group;
    }

    function instance($$self, $$props, $$invalidate) {
    	let chords;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let useFont = false;

    	let chordtext = `# Chords for The Girl from Ipanema
Fmaj7  8879xx
G7     10,10,9,10,x,x
Gm7    10,10,8,10,x,x
F7     9989xx

GbMaj7 9,9,8,10,x,x
#      ^ Use commas for higher frets

B7     7978xx
F#m7   9979xx
D7     5545xx
Eb7    6656xx
D7b9   5x454x

Fmaj7      132211    132111
#^ Title   ^ Frets   ^ Fingerings

# Lines that start with "#" are ignored
# Follow me on GitHub @Explosion-Scratch`;

    	let printing = false;

    	onMount(() => {
    		if (localStorage.chordtext) {
    			$$invalidate(0, chordtext = localStorage.chordtext);
    		}

    		window.addEventListener("beforeprint", () => {
    			$$invalidate(2, printing = true);
    		});

    		window.addEventListener("afterprint", () => {
    			$$invalidate(2, printing = false);
    		});

    		let font = new FontFace("realbook", `url(${JSON.stringify(realbook)})`);

    		font.load().then(() => {
    			document.fonts.add(font);
    		});
    	});

    	function save() {
    		localStorage.chordtext = chordtext;
    	}

    	let title = "The Girl from Ipanema";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(2, printing = false);

    	function input_change_handler() {
    		useFont = this.checked;
    		$$invalidate(1, useFont);
    	}

    	function textarea_input_handler() {
    		chordtext = this.value;
    		$$invalidate(0, chordtext);
    	}

    	const click_handler_1 = () => ($$invalidate(2, printing = true), tick().then(() => window.print()));

    	function input_input_handler() {
    		title = this.value;
    		$$invalidate(3, title);
    	}

    	$$self.$capture_state = () => ({
    		realbook,
    		tick,
    		Chord,
    		Chordjs,
    		onMount,
    		useFont,
    		chordtext,
    		printing,
    		group,
    		save,
    		title,
    		chords
    	});

    	$$self.$inject_state = $$props => {
    		if ('useFont' in $$props) $$invalidate(1, useFont = $$props.useFont);
    		if ('chordtext' in $$props) $$invalidate(0, chordtext = $$props.chordtext);
    		if ('printing' in $$props) $$invalidate(2, printing = $$props.printing);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('chords' in $$props) $$invalidate(4, chords = $$props.chords);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*chordtext*/ 1) {
    			$$invalidate(4, chords = chordtext.trim().split("\n").map(i => i.replace(/\s+/g, " ")).filter(i => !i.startsWith("#")).map(i => i.trim().split(" ")).filter(i => i.length >= 2).map(i => {
    				if (i[0] === "!empty") {
    					return { type: "empty" };
    				}

    				let out = {
    					name: i[0].replaceAll("_", " "),
    					frets: i[1].split("").map(i => parseInt(i, 10)),
    					fingers: i[2]?.split("").map(i => i.toLowerCase() === "x" ? "0" : i).map(i => parseInt(i, 10)).filter(i => !isNaN(i)),
    					shift: parseInt(i[3], 10) || 0
    				};

    				if (i[1]?.includes(",")) {
    					let b = thing(i[1]);
    					console.log(b, i);
    					out.frets = b.frets;
    					out.shift = out.shift + b.shift;
    				}

    				out.frets = out.frets.map(i => {
    					if (typeof i === "string") {
    						return -1;
    					}

    					return i;
    				}).map(i => isNaN(i) ? -1 : i);

    				return out;

    				function thing(a) {
    					const formatted = a.split(",").map(i => parseInt(i, 10));
    					const min = Math.min(...formatted.filter(i => !isNaN(i)));

    					return {
    						frets: formatted.map((i, idx) => isNaN(i) ? a[idx] : i - min),
    						shift: min
    					};
    				}
    			}));
    		}
    	};

    	return [
    		chordtext,
    		useFont,
    		printing,
    		title,
    		chords,
    		save,
    		click_handler,
    		input_change_handler,
    		textarea_input_handler,
    		click_handler_1,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
