import '../less/main.less';
import commonProps from "./commons";
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
        filterTypeContainerSelector: "js-filter-type",
        filterColorContainerSelector: "js-filter-color",
        filterGenderContainerSelector: "js-filter-gender",
        emptyMsgSelector: "js-empty-msg",
      },
      $cardsContainer: null,
      $loader: null,
      hidden: "hidden",
    }
    const init = () => {
      initElements();
      showLoader()
      initFetching();
    }
    const initElements = () => {
      props.$loader = document.querySelector("." + props.selectors.loaderContainerSelector);
      commonProps.$emptyMessage = document.querySelector("." + props.selectors.emptyMsgSelector);
      initFilter();
      initSearchInput();
      props.$cardsContainer = document.querySelector("." + props.selectors.cardsContainerSelector);
      cards.props.$cardsContainer = props.$cardsContainer;
    }
    const initSearchInput = () => {
      const $searchInput = document.querySelector("." + props.selectors.searchInputSelector);
      let timeout;
      $searchInput.addEventListener("keyup", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const value = $searchInput.value;
          filters.props.text = value.toLowerCase();
          filters.filterPokemonList();
        }, 500)
      })
    };
    const initFilter = () => {
      filters.props.$cardsContainer = props.$cardsContainer;
      filters.props.$filtersTypeContainer = document.querySelector("." + props.selectors.filterTypeContainerSelector);
      filters.props.$filtersColorsContainer = document.querySelector("." + props.selectors.filterColorContainerSelector);
      filters.props.$filtersGenderContainer = document.querySelector("." + props.selectors.filterGenderContainerSelector);
    }
    const initFetching = async () => {
      fetchPokemonData(props.API_URL + props.END_POINTS.NATIONAL)
        .then(async (entries) => {
          const promises = entries.pokemon_entries.map(processPokemonEntry);
          return Promise.all(promises);
        })
        .then((processedPokemons) => {
          if (processedPokemons?.length > 0) {
            commonProps.pokemonList?.push(...processedPokemons);
            commonProps.pokemonList.sort((a, b) => a.id - b.id);
            commonProps.pokemonList.slice(commonProps.currentIndex, commonProps.currentIndex + 20)?.forEach(pokemon => {
              cards.generateCard(pokemon, props.$cardsContainer);
            });
            commonProps.auxcommonProps = commonProps.pokemonList;
            const btn = document.querySelector("." + props.selectors.loadMoreBtnSelector)
            btn?.addEventListener("click", showMore);
          }
          hideLoader();
        })
        .catch(error => {
          hideLoader();
          console.error('Error:', error);
        });
      fetchAllFiltersData();
    }
    const fetchAllFiltersData = async () => {
      const filtersData = {};
      filtersData.type = await fetchFilterData(props.END_POINTS.TYPES);
      filtersData.color = await fetchFilterData(props.END_POINTS.COLORS);
      filtersData.gender = await fetchFilterData(props.END_POINTS.GENDER);
      filters.loadFilters(filtersData);
    }
    const fetchFilterData = async (ENDPOINT) => {
      const filterData = await fetchPokemonData(props.API_URL + ENDPOINT)
      if (filterData) {
        return filterData.results.map(data => data.name);
      }
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
      commonProps.currentIndex = 20;
      const nextPokemons = commonProps.pokemonList.slice(commonProps.currentIndex, commonProps.currentIndex + 20);
      nextPokemons?.forEach(pokemon => {
        cards.generateCard(pokemon);
      });
    }
    const showLoader = () => {
      props.$loader.classList.remove(props.hidden);
    }
    const hideLoader = () => {
      props.$loader.classList.add(props.hidden);
    }
    init();
  }
  document.addEventListener("DOMContentLoaded", pokedex);
})();
