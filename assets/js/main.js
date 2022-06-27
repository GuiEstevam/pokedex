Vue.createApp({
    data() {
        return {
            list: [],
            filter: "",
            filterType: "",
            pokedexOpen: false,
            pokemon: {
                sprites:{
                    other:{
                        'official-artwork':{
                            front_default: "",
                        }
                    }
                }
            },
        }
    },
    computed:{
        // Lista e seus filtros 
        filteredList() { 
        var self = this;
        self.list = self.sortAPI(self.list);
        var result = [];
        for (var i in self.list) {
            var item = self.list[i];
            if (
                (self.filter == "" || self.normalizar(item.name).indexOf(self.normalizar(self.filter)) != -1) &&
                (self.filterType == "" || self.checkType(item.types))
            ) {
                result.push(item);
            }
        }
        return result;
        }
    },
    methods:{
        // Fetch de dados da API
        async getAPI(){
            var self = this;
            var pokelist = [];
                await fetch("https://pokeapi.co/api/v2/pokemon/?limit=151")
                .then(response => response.json())
                .then(function(data){
                    pokelist = data.results;
                    for(pokemon of pokelist){
                        fetch(pokemon.url)
                        .then(resp => resp.json())
                        .then(function(data){
                            pokemon = data;
                            self.list.push(pokemon);
                        });
                    };
                }).catch(function (erro) {
                    console.log(erro);
                });
        },
        // Listagem ordenada 
        sortAPI(list){ 
            return list.sort((a,b)=>{
                return a.id - b.id;
            });
        },
        // Normalização dos dados
        normalizar(value) {
            return value ? (value+'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") : "";
        },
        // Checagem de tipo para filtro de tipo
        checkType(arr){ 
            var self = this;
            console.log(arr)
            for(item of arr){
                if(item.type.name == self.filterType){
                    return true;
                }
            }
            return false;
        },
        // Informações do pokemon selecionado
        pokedex(item){
            var self = this;
            self.pokedexOpen = true;
            self.pokemon = item;
        },
    },
    mounted(){
        var self = this;
        // Mantedor do tipo de pokemon selecionado para pesquisa
        if(localStorage.filterType){
            this.filterType = localStorage.filterType;
        }
            self.getAPI()
    },
    watch:{
        // Visualizador do filtro
        filterType(newfilterType){
                 localStorage.filterType = newfilterType 
         },
    }
}).mount('#app');