const cards = {
    props: {
        $cardsContainer: null,
    },
    generatePokemonId: (id) => {
        return '#' + String(id).padStart(4, '0');
    },
    generateSRC: (id) => {
        if(id){
          id = String(id).padStart(3, '0')
          return `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id}.png`
        }
    },
    generateCard: (data) => {
        if (!data) {
            return;
        }
        const $card = document.createElement("article");
        const id = data.id ? cards.generatePokemonId(data.id) : "#0000";
        const hp = data.stats[0].base_stat;
        //dream_world image just look better
        const imgSrc = data.sprites.other.dream_world.front_default || cards.generateSRC(data.id);
        const pokeName = data.name[0].toUpperCase() + data.name.slice(1);
        const statAttack = data.stats[1].base_stat;
        const statDefense = data.stats[2].base_stat;
        const statSpeed = data.stats[5].base_stat;
        const gender = data.gender;
        $card.classList.add("pokemon-card");
        $card.innerHTML = cards.cardBody({ hp, imgSrc, pokeName, id, statAttack, statDefense, statSpeed, gender });
        cards.appendTypes(data.types, $card);
        cards.styleCard(data.color, $card);
        cards.props.$cardsContainer.appendChild($card);
    },
    cardBody: ({ hp, imgSrc, pokeName, id, statAttack, statDefense, statSpeed, gender }) => {
        return `
          <p class="pokemon-card__hp">
            <span>HP</span>
              ${hp}
          </p>
          <img class="pokemon-card__img" alt="pokeimage" src=${imgSrc} />
          <h2 class="pokemon-card__name">${pokeName}</h2>
          <div class="pokemon-card__id">
            <span>${id}</span>
          </div>
          <div class="pokemon-card__types">
          
          </div>
          <div class="pokemon-card__stats">
            <div>
              <h3>${statAttack}</h3>
              <p>Attack</p>
            </div>
            <div>
              <h3>${statDefense}</h3>
              <p>Defense</p>
            </div>
            <div>
              <h3>${statSpeed}</h3>
              <p>Speed</p>
            </div>
            <div>${gender}</div>
          </div>
        `;
    },
    appendTypes: (types, $card) => {
        types.forEach((item) => {
            const $span = document.createElement("SPAN");
            $span.textContent = item.type.name;
            $span.classList.add("type", `type--${item.type.name}`)
            $card.querySelector(".pokemon-card__types").appendChild($span);
        });
    },
    styleCard: (color, card) => {
        if (color && color == "white") { color = "grey"; }
        card.style.background = `radial-gradient(circle at 50% 0%, ${color} 36%, #ffffff 36%)`;
    }
}

export default cards;
