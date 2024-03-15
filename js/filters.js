import commonProps from "./commons";
import cards from "./cards";
const filters = {
    props: {
        $filtersTypeContainer: null,
        $filtersColorsContainer: null,
        $filtersGenderContainer: null,
        apliedFilters: { type: [], color: [], gender: [] },
        text: "",
        hidden: "hidden",
    },
    loadFilters: (filtersData) => {
        if (filtersData) {
            filtersData.type?.forEach(filters.createTypesFilter);
            filtersData.color?.forEach(filters.createColorsFilter);
            filtersData.gender?.forEach(filters.createGenderFilters);
            filters.createGenderFilters("both");
        }
    },
    createTypesFilter: (type) => {
        const $div = filters.createDivElement("type", type);
        $div.textContent = type;
        $div.classList.add("type", `type--${type}`)
        filters.props.$filtersTypeContainer.appendChild($div);
        $div.addEventListener("click", () => { filters.applyFilter($div, "type") });
    },
    createColorsFilter: (color) => {
        const $div = filters.createDivElement("color", color);
        $div.style.backgroundColor = color;
        filters.props.$filtersColorsContainer.appendChild($div);
        $div.addEventListener("click", () => { filters.applyFilter($div, "color") });
    },
    createGenderFilters: (gender) => {
        const $div = filters.createDivElement("gender", gender);
        $div.textContent = gender;
        filters.props.$filtersGenderContainer.appendChild($div);
        $div.addEventListener("click", () => { filters.applyFilter($div, "gender") });
    },
    createDivElement: (name, filter) => {
        const $div = document.createElement("div");
        $div.dataset[name] = filter;
        return $div;
    },
    applyFilter: ($el, filter) => {
        try {
            if (!$el || !filter) {
                return;
            }
            const apliedFilters = filters.props.apliedFilters;
            const dataFilter = $el.getAttribute(`data-${filter}`) || "";
            if (apliedFilters) {
                if (apliedFilters[`${filter}`].includes(dataFilter)) {
                    apliedFilters[`${filter}`] = apliedFilters[`${filter}`].filter(el => el !== dataFilter);
                    $el.classList.remove("mod--active");
                } else {
                    apliedFilters[`${filter}`].push(dataFilter);
                    $el.classList.add("mod--active");
                }
                filters.filterPokemonList();
            }
        } catch (error) {
            console.error('Error applying the filters:', error);
        }
    },
    filterPokemonList: () => {
        commonProps.pokemonList = commonProps.auxcommonProps;
        for (const [key, value] of Object.entries(filters.props.apliedFilters)) {
            if (Array.isArray(value) && value.length > 0) {
                switch (key) {
                    case "type":
                        commonProps.pokemonList = filters.filterType(value);
                        break;
                    case "color":
                        commonProps.pokemonList = filters.filterColor(value);
                        break;
                    case "gender":
                        commonProps.pokemonList = filters.filterGender(value);
                        break;
                    default:
                        break;
                }
            }
            if (filters.props.text) {
                commonProps.pokemonList = filters.filterName(filters.props.text, commonProps.pokemonList);
            }
        }
        cards.props.$cardsContainer.innerHTML = "";
        commonProps.currentIndex = 0;
        if (commonProps.pokemonList.length > 0) {
            commonProps.$emptyMessage.classList.add(filters.props.hidden);
            commonProps.pokemonList.slice(commonProps.currentIndex, commonProps.currentIndex + 20)?.forEach(cards.generateCard);
        } else {
            commonProps.$emptyMessage.classList.remove(filters.props.hidden);
        }
    },
    filterType: (types) => {
        return commonProps.pokemonList.filter(pokemon => pokemon.types.some(t => types.includes(t.type.name)))
    },
    filterColor: (colors) => {
        return commonProps.pokemonList.filter(pokemon => colors.includes(pokemon.color))
    },
    filterGender: (genders) => {
        return commonProps.pokemonList.filter(pokemon => genders.includes(pokemon.gender.toLowerCase()))
    },
    filterName: (text) => {
        return commonProps.pokemonList.filter(pokemon => pokemon.name.includes(text) || pokemon.id == text);
    }
}

export default filters;