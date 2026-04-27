(function(){
    const elementNavbarButton = document.querySelectorAll('.main-navbar nav-button')
    const elementMain = document.querySelector('.main')
    const elementDescription = document.querySelector('.description')
    const arrElementSections = Array.from(document.querySelectorAll('.main .section'))
    elementNavbarButton.forEach(button => {
        button.addEventListener('nav-button-click', () => {
            const link = button.getAttribute('link')
            const targetSection = arrElementSections.find(section => section.id === `${link}`)
            if (targetSection) window.scrollTo({ top: targetSection.offsetTop - 60, behavior: 'smooth' })
        })
    })

    fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
        const {project, work} = data
        const elementProjectSection = arrElementSections.find(section => section.id === 'project')
        const elementWorkSection = arrElementSections.find(section => section.id === 'work')

        elementProjectSection.querySelector('.inner').append(...project.map(createTileBlock))
        elementWorkSection.querySelector('.inner').append(...work.map(createTileBlock))
    }).finally(() => {
        document.dispatchEvent(new CustomEvent('loading-complete', {bubbles: true, composed: true}))
    })

    function createTileBlock(data) {
        const elementTileBlock = document.createElement('tile-block')
        const scriptTag = document.createElement('script')
        scriptTag.type = 'application/json'
        scriptTag.textContent = JSON.stringify(data)
        elementTileBlock.appendChild(scriptTag)
        return elementTileBlock
    }

    document.addEventListener('tile-block-click', (event) => {
        const {title, image, tag, description} = event.detail
        console.log('Tile Block Clicked:', {title, image, tag, description})
    })
})()