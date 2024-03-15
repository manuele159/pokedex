import '../less/main.less';
import filters from './filters';
import cards from './cards';

(() => {
  const pokedex = () => {
    const props = {
      API_URL: "https://pokeapi.co/api/v2",
      END_POINTS: {
        NATIONAL: "/pokedex/national",
        TYPES: "/type",
        GENDER: "/gender",
        COLORS: "/pokemon-color" 
      },
      selectors: {
        searchInputSelector: "js-filter-search",
        cardsContainerSelector: "js-cards-container",
        loaderContainerSelector: "js-loader",
        loadMoreBtnSelector: "js-show-more",
      },
      auxPokemonList: [],
      pokemonList: [],
      currentIndex: 0,
      $cardsContainer: null,
    }
    const init = () => {
      const loader = document.querySelector("."+props.selectors.searchInputSelector);
      props.$cardsContainer = document.querySelector("."+props.selectors.cardsContainerSelector);
      initFetching(loader);
    }
    const fetchPokemonData = async function (url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        throw error;
      }
    }
    const initFetching = async () => {
      fetchPokemonData(props.API_URL + props.END_POINTS.NATIONAL)
      .then(async (entries) => {
        const promises = entries.pokemon_entries.map(processPokemonEntry);
        return Promise.all(promises);
      })
      .then((processedPokemons) => {
        if (processedPokemons?.length > 0) {
          props.pokemonList.push(...processedPokemons);
          props.pokemonList.sort((a, b) => a.id - b.id);
          props.pokemonList.slice(props.currentIndex, props.currentIndex + 20)?.forEach(pokemon => {
            cards.generateCard(pokemon, props.$cardsContainer);
          });
          props.auxPokemonList = props.pokemonList;
          const btn = document.querySelector("." + props.selectors.loadMoreBtnSelector)
          btn?.addEventListener("click", showMore);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
    const processPokemonEntry = async (entry) => {
      let pokemon = {};
      try {
        const specieData = await fetchPokemonData(entry.pokemon_species.url);
        const variationData = await fetchPokemonData(specieData.varieties[0].pokemon.url);
        if (specieData && variationData) {
          pokemon = buildPokemonObj(specieData, variationData); 
          Object.assign(pokemon, variationData);
        }
        return pokemon;
      } catch (error) {
        console.error('Error processing Pokemon entry:', error);
        throw error;
      }
    };
    const buildPokemonObj = (specieData, variationData) => {
      return {
        color: specieData.color.name,
        gender: getGender(specieData.gender_rate),
      }
    }
    const getGender = (gender_rate) => {
      switch (gender_rate) {
        case -1:
          return "Genderless";
        case 0:
          return "Male";
        case 8:
          return "Female";
        default:
          return "Both";
      }
    }
    const showMore = () => {
      console.log("LOAD MORE")
    }
    init();
  }
  document.addEventListener("DOMContentLoaded", pokedex);
  })();
