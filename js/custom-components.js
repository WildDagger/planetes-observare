(function() {
    class IconLogo extends HTMLElement {
        static get observedAttributes() {
            return ['planet']
        }

        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    :host {
                        --size: 100px;
                        display: inline-block;
                    }
                    
                    svg {
                        width: var(--size);
                        height: var(--size);
                        fill: currentColor;
                    }
                </style>
                <svg></svg>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            const planet = this.getAttribute('planet')

            if (planet) {
                this._render(planet)
            }
        }

        attributechangedCallback(name, oldValue, newValue) {
            if (!this.shadowRoot || oldValue == newValue) return

            if (name === 'planet') {
                this._render(newValue)
            }
        }

        _render(planet) {
            if (!this.shadowRoot) {
                this.attachShadow({mode: "open"})
            }

            fetch('img/icon-planets.svg').then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser()
                const doc = parser.parseFromString(svgText, 'image/svg+xml')
                const symbol = doc.querySelector(`#${planet}`)
                const viewBox = symbol.getAttribute('viewBox')
                const inner = symbol.innerHTML

                this.shadowRoot.appendChild(IconLogo._template.content.cloneNode(true))
                const elementSVG = this.shadowRoot.querySelector('svg')
                elementSVG.setAttribute('viewBox', viewBox)
                elementSVG.innerHTML = inner
            })
        }
    }

    class LoadingOverlay extends HTMLElement {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    .loading-overlay {
                        z-index: 9999;
                        width: 100vw;
                        height: 100vh;
                        overflow: hidden;
                        background-color: #fff;
                        position: fixed;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        top: 0;
                        left: 0;
                        opacity: 1;
                        transition: opacity 1s ease-out;
                    }

                    .loading-overlay .loader {
                        position: relative;
                        margin: 0 auto;
                        width: 100px;
                    }

                    .loading-overlay .loader::before {
                        content: '';
                        display: block;
                        padding-top: 100%;
                    }

                    .loading-overlay .loader .circular {
                        animation: rotate 2s linear infinite;
                        height: 100%;
                        transform-origin: center center;
                        width: 100%;
                    }

                    .path {
                        stroke-dasharray: 1, 200;
                        stroke-dashoffset: 0;
                        animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
                        stroke-linecap: round;
                    }
                    
                    @keyframes rotate {
                        100% {
                        transform: rotate(360deg);
                        }
                    }
                    
                    @keyframes dash {
                        0% {
                            stroke-dasharray: 1, 200;
                            stroke-dashoffset: 0;
                        }
                        50% {
                            stroke-dasharray: 89, 200;
                            stroke-dashoffset: -35px;
                        }
                        100% {
                            stroke-dasharray: 89, 200;
                            stroke-dashoffset: -124px;
                        }
                    }
                    
                    @keyframes color {
                        100%,
                        0% {
                            stroke: #be8832;
                        }
                        20% {
                            stroke: #d12d33;
                        }
                        40% {
                            stroke: #fca211;
                        }
                        60% {
                            stroke: #007c59;
                        }
                        80% {
                            stroke: #0074c6;
                        }
                    }
                </style>
                <div class="loading-overlay" data-wait-for="main news">
                    <div class="loader">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                        </svg>
                    </div>
                </div>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this.shadowRoot.appendChild(LoadingOverlay._template.content.cloneNode(true))

            document.addEventListener('loading-complete', () => {
                var overlay = this.shadowRoot.querySelector('.loading-overlay')
                overlay.style.opacity = 0
                setTimeout(() => {
                    overlay.style.display = 'none'
                    this.style.display = 'none'
                }, 1000)
            })
        }
    }

    class TileBlock extends HTMLElement {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                :host {
                    display: block;
                }

                .item {
                    width: 210px;
                    height: 210px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                    justify-content: center;
                    padding: 12px;
                    margin: 10px;
                    cursor: pointer;
                    background-color: var(--tile-bg-color, #fff);
                    color: var(--tile-text-color, #000);
                    transition: scale 0.3s ease;
                }

                .item:hover {
                    scale: 1.05;}

                .item-image {
                    width: 100px;
                    height: 100px;
                    object-fit: cover;
                    margin-bottom: 1rem;
                }

                .item-title {
                    font-size: 1.2rem;
                    text-align: left;
                }
                </style>
                <article part="tile" class="item">
                    <img class="item-image">
                    <h1 class="item-title"></h1>
                </article>
            `
            return template
        })()

        connectedCallback() {
            const scriptTag = this.querySelector('script[type="application/json"]')

            try {
                const {image, title, tag, description} = JSON.parse(scriptTag?.textContent || '{}')
                this._image = image == '' ? 'img/thumbnail.png' : image
                this._title = title
                this._tag = tag
                this._description = description
            } catch (e) {
                console.error('Failed to parse item data:', e)
                return
            }

            this.attachShadow({mode: "open"})
            this.shadowRoot.appendChild(TileBlock._template.content.cloneNode(true))

            const elementItemImage = this.shadowRoot.querySelector('.item-image')
            const elementItemTitle = this.shadowRoot.querySelector('.item-title')

            elementItemImage.src = this._image
            elementItemTitle.textContent = this._title

            this.shadowRoot.querySelector('.item').addEventListener('click', () => {
                const event = new CustomEvent('tile-block-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        title: this._title,
                        image: this._image,
                        tag: this._tag,
                        description: this._description
                    }
                })
                this.dispatchEvent(event)
            })
        }
    }

    class MainFooter extends HTMLElement {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                    .footer {
                        background-color: var(--footer-bg-color);
                        color: var(--footer-text-color);
                        text-align: center;
                        padding: 1rem;
                    }
                </style>
                <footer class="footer">
                    <p>&copy; 2026 Planetes Observare. All rights reserved.</p>
                </footer>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this.shadowRoot.appendChild(MainFooter._template.content.cloneNode(true))
        }
    }

    class StarBackground extends HTMLElement {
        static _template = (() => {
            const template = document.createElement('template')
            template.innerHTML = `
                <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                div { 
                    position: relative; 
                    width: 100%;
                    height: 100%;
                }

                .sky {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(#336 0, #000 100%);
                }
                .star {
                    width: 100%;
                    height: 100%;
                    background: repeating-linear-gradient(
                        35deg,
                        #0000 1px, #0000 2px,
                        #000 2px, #000 51px,
                        #000 51px, #000 52px,
                        #000 52px, #000 80px),
                        repeating-linear-gradient(
                        -35deg,
                        #fff 1px, #fff 2px,
                        #000 2px, #000 51px,
                        #fff8 51px, #fff8 52px,
                        #000 52px, #000 80px);
                    mix-blend-mode: screen;
                    background-size: 200% 200%;
                    background-position: 350% -50%;
                    animation: skyMove linear infinite 100s;
                }
                .star::before, .star:after {
                    content: ''
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    mix-blend-mode: screen;
                }
                
                .star::before {
                    background: repeating-linear-gradient(80deg,
                        #0000 1px, #0000 2px,
                        #000 2px, #000 51px),
                        repeating-linear-gradient(
                        0deg,
                        #fffa 1px, #fffa 2px,
                        #000 2px, #000 51px);
                    background-size: 200% 200%;
                    background-position: 350% -50%;
                    animation: skyMove linear infinite 120s;
                }
                .star::after {
                    background: repeating-linear-gradient(
                        35deg,
                        #0000 1px, #0000 2px,
                        #000 100px, #000 500px),
                        repeating-linear-gradient(
                        -35deg,
                        #fff 1px, #fff 2px,
                        #000 2px, #000 400px);
                    background-size: 200% 200%;    
                    background-position: 135% 60%;
                    animation: starMove infinite linear 5s;
                }

                @keyframes skyMove {
                    0%{background-position: 0% 0%;}
                    100%{ background-position: 200% 0%;}
                }

                @keyframes starMove {
                    0%{background-position: 135% 60%;}
                    100%{ background-position: 350% -50%;}
                }
                </style>
                <div class="sky">
                    <div class="star"></div>
                </div>
            `
            return template
        })()

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this.shadowRoot.appendChild(StarBackground._template.content.cloneNode(true))
        }
    }

    customElements.define('icon-logo', IconLogo)
    customElements.define('tile-block', TileBlock)
    customElements.define('main-footer', MainFooter)
    customElements.define('loading-overlay', LoadingOverlay)
    customElements.define('star-background', StarBackground)
})()