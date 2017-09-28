/**
 * [vue_client.js]
    encoding=utf-8
 */


var setupVue = function( createVueInstance, axiosInstance ){
    var app = createVueInstance({
        el: '#app',
        data: {
          characters: []
        },
        methods: {
          getCharacters() {
            var url = 'https://gist.githubusercontent.com/anonymous/c41ae1698aca3595b95d1496ebf42d83/raw/2addeb281bcb4aae2be9c8204c0ec623c4cb446c/characters.json';
            axiosInstance.get(url).then(x => { this.characters = x.data; });
          }
        },
        mounted() {
          this.getCharacters();
        }
    });
};


var CREATE_VUE_INSTANCE = function(options){
    return new Vue(options);
};
if( typeof window !== 'undefined' ){
    window.onload = function(){
        setupVue( CREATE_VUE_INSTANCE, axios );
    };
}else{
    exports.setupVue = setupVue;
}


