$('button.filter').on('click', function(){

    const cards = Array.from(document.querySelectorAll('.card'));
    const buttons = Array.from(document.querySelectorAll('.filter'));
    for(card of cards){
        card.parentElement.style.display = 'none';
    }

    for(button of buttons){
        button.classList.remove('active');
        button.removeAttribute('aria-pressed');
    }
    this.classList.add('active');
    this.setAttribute('aria-pressed', 'true');

    const categoryOne = this.getAttribute('category-one');
    const categoryTwo = this.getAttribute('category-two');

    const result = cards.filter(card => card.getAttribute('category') === categoryOne || card.getAttribute('category') === categoryTwo || categoryOne === 'all');

    for(card of result){
        card.parentElement.style.display = 'block';
    }

});