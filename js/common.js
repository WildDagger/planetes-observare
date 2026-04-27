(function(){
    // Navbar
    class NavButton extends HTMLElement {
        static getDefaults() {
            return {
                "link": "#",
                "target": "_self"
            }
        }

        static get observedAttributes() {
            return ["lang"]
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    a {
                        display: inline-flex; 
                        align-items: center; 
                        padding: 8px 16px;
                        text-decoration: none;
                        transition: all 0.3s;
                        color: var(--nav-link-color, #00f);
                        background-color: var(--nav-link-background-color, transparent);
                    }
                    
                    a:hover {
                        font-weight: 500;
                        background-color: var(--nav-link-hover-background-color, transparent);
                        color: var(--nav-link-hover-color, #f00);
                    }

                    ::slotted(svg) {
                        display: block;
                        width: var(--nav-link-icon-width);
                        height: var(--nav-link-icon-height);
                        flex-shrink: 0;
                    }
                </style>
                <a part="link">
                    <slot></slot>
                </a>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this._render(
                this.getAttribute("link") ?? this.constructor.getDefaults().link,
                this.getAttribute("target") ?? this.constructor.getDefaults().target
            )
            this.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('nav-button-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.getAttribute('data-nav-id'),
                        link: this.getAttribute('link'),
                        target: this.getAttribute('target')
                    }
                }))
            })
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.shadowRoot || oldValue == newValue) return

            if (name == "link") {
                this.shadowRoot.querySelector('a')?.setAttribute('href', newValue ?? this.constructor.getDefaults().link)
            }

            if (name == "target") {
                this.shadowRoot.querySelector('a')?.setAttribute('target', newValue ?? this.constructor.getDefaults().target)
            }
        }

        _render(link, target) {
            if (!this.shadowRoot) {
                this.attachShadow({mode: "open"})
            }
            this.shadowRoot.appendChild(NavButton._template.content.cloneNode(true))

            const elementLink = this.shadowRoot.querySelector('a')
            if (elementLink) {
                elementLink.setAttribute('href', link)
                elementLink.setAttribute('target', target)

                elementLink.addEventListener('click', (e) => {
                    e.preventDefault()
                })
            }
        }
    }

    class NavDropdown extends HTMLElement {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    .trigger { cursor: pointer; }
                    .items {
                    display: none;
                    position: absolute;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    padding: 4px 0;
                    min-width: 160px;
                    }
                    :host([open]) .items { display: block; }
                </style>
                <div class="trigger">
                    <slot name="trigger"></slot>
                </div>
                <div class="items">
                    <slot></slot>
                </div>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(NavDropdown._template.content.cloneNode(true))

            this.shadowRoot.querySelector('.trigger')?.addEventListener('click', () => this.toggleAttribute('open'));
        }
    }

    class NavDropdownItem extends NavButton {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <a part="link" role="menuitem">
                    <slot></slot>
                </a>
            `
            return template
        })

        _render(link, target) {
            this.shadowRoot.appendChild(NavDropdownItem._template.content.cloneNode(true))

            const elementLink = this.shadowRoot.querySelector('a')
            if (elementLink) {
                elementLink.setAttribute('href', link)
                elementLink.setAttribute('target', target)
            }
        }
    }

    class NavMenu extends HTMLElement {
        static get observedAttributes() {
            return ["lang"]
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    .menu {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .hamburger {
                        display: none;
                        cursor: pointer;
                    }

                    .items {
                        display: flex;
                        gap: var(--nav-menu-items-gap, 8px);
                    }

                    :host([mobile]) .hamburger { display: block; }
                    :host([mobile]) .items {
                        display: none;
                        position: absolute;
                        top: 60px;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        padding: 8px 0;
                    }

                    :host([mobile][open]) .items { display: flex; }
                </style>
                <div class="menu">
                    <button class="hamburger" aria-label="選單" aria-expanded="false">☰</button>
                    <div part="item-menu" class="items">
                        <slot></slot>
                    </div>
                </div>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(NavMenu._template.content.cloneNode(true))

            this.shadowRoot.querySelector('.hamburger')?.addEventListener('click', () => this.#toggleOpen())
        }
        
        #toggleOpen() {
            const isOpen = this.toggleAttribute('open')
            this.shadowRoot.querySelector('.hamburger')?.setAttribute('aria-expanded', isOpen)
        }
    }

    class NavBrand extends HTMLElement {
        static get observedAttributes() {
            return ["lang"]
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                </style>
                <div class="nav-brand">
                    <slot></slot>
                </div>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(NavBrand._template.content.cloneNode(true))
        }
    }

    class MainNavbar extends HTMLElement {
        static getDefaults() {
            return {
                'layout': 'space-between'
            }
        }

        static get observedAttributes() {
            return ["lang"]
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    :host {
                        display: contents;
                    }

                    nav {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        position: fixed;
                        height: 48px;
                        padding: 6px 12px;
                        width: calc(100% - 24px);
                        z-index: 1000;
                        top: 0;
                        left: 0;
                    }
                    nav-menu {
                        margin-left: auto;
                    }
                </style>
                <nav part="main">
                    <slot></slot>
                </nav>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            const layout = this.getAttribute('layout') ?? this.constructor.getDefaults().layout

            if (layout == "flex-start") {
                this._render("flex-start")
            } else if (layout == "flex-end") {
                this._render("flex-end")
            } else if (layout == "center") {
                this._render("center")
            } else {
                this._render(this.constructor.getDefaults().layout)
            }

            this._onMQChange = (e) => this.#setMobile(e.matches);
            this._mq = window.matchMedia('(max-width: 768px)');
            this._mq.addEventListener('change', this._onMQChange);
            this.#setMobile(this._mq.matches);
        }

        _render(layout) {
            this.shadowRoot.appendChild(MainNavbar._template.content.cloneNode(true))
            this.shadowRoot.querySelector('nav')?.setAttribute('style', `justify-content: ${layout};`)
        }

        disconnectedCallback() {
            this._mq?.removeEventListener('change', this._onMQChange);
        }

        #setMobile(isMobile) {
            this.toggleAttribute('mobile', isMobile);
            // 通知 nav-menu 切換模式
            this.querySelector('nav-menu')?.toggleAttribute('mobile', isMobile);
        }
    }

    customElements.define('nav-button', NavButton)
    customElements.define('nav-dropdown', NavDropdown)
    customElements.define('nav-dropdown-item', NavDropdownItem)
    customElements.define('nav-menu', NavMenu)
    customElements.define('nav-brand', NavBrand)
    customElements.define('main-navbar', MainNavbar)

    // Ordinary Components
    class LinkButton extends HTMLElement {
        static getDefaults() {
            return {
                "link": "#",
                "target": "_self"
            }
        }

        static get observedAttributes() {
            return ["lang"]
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    a {
                        text-decoration: none;
                        transition: all 0.3s;
                        display: inline-block;
                        padding: 8px 16px;
                        color: var(--button-link-color, #000);
                        border: 2px solid var(--button-link-border-color, #fff);
                        border-radius: 8px;
                    }
                    
                    a:hover {
                        background-color: var(--button-link-hover-bg, #fff);
                        color: var(--button-link-hover-color, #000);
                    }
                </style>
                <a part="link">
                    <slot></slot>
                </a>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this._render(
                this.getAttribute("link") ?? this.constructor.getDefaults().link,
                this.getAttribute("target") ?? this.constructor.getDefaults().target
            )
            this.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('button-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.getAttribute('data-link-id'),
                        link: this.getAttribute('link'),
                        target: this.getAttribute('target')
                    }
                }))
            })
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.shadowRoot || oldValue == newValue) return

            if (name == "link") {
                this.shadowRoot.querySelector('a')?.setAttribute('href', newValue ?? this.constructor.getDefaults().link)
            }

            if (name == "target") {
                this.shadowRoot.querySelector('a')?.setAttribute('target', newValue ?? this.constructor.getDefaults().target)
            }
        }

        _render(link, target) {
            if (!this.shadowRoot) {
                this.attachShadow({mode: "open"})
            }
            this.shadowRoot.appendChild(LinkButton._template.content.cloneNode(true))
            const elementLink = this.shadowRoot.querySelector('a')
            if (elementLink) {
                elementLink.setAttribute('href', link)
                elementLink.setAttribute('target', target)
                elementLink.addEventListener('click', (e) => {
                    e.preventDefault()
                })
            }
        }
    }

    customElements.define('link-button', LinkButton)
})()