const Mega = require('megadb');
const sitesCadastrados = new Mega.crearDB('Sites')
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

require("./server.js")

function isHTML(str) {
    const dom = new JSDOM(`<body></body>`);
    var a = dom.window.document.createElement('div');
    a.innerHTML = str;

    for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1) return true; 
    }

    return false;
}

async function valide(response, linkPai) {
    try{
    var todosOsLinks = [];

    response.data.split("<a").forEach((val) => {
        var link = null
        var name = null;
        val.split(`href="`).forEach((val) => {
            link = val.split('"')[0]
        })
        name = val.split(`>`)[1].split(`</a>`)[0].replace('</a', "")
        

        todosOsLinks.push({name, link, linkPai: linkPai})
    })

    response.data.split("<a").forEach((val) => {
        var link = null
        var name = null;
        val.split('href=`').forEach((val) => {
            link = val.split('`')[0]
        })
        name = val.split(`>`)[1].split(`</a>`)[0].replace('</a', "")
        
        todosOsLinks.push({name, link, linkPai: linkPai}) 
    })

    response.data.split("<a").forEach((val) => {
        var link = null
        var name = null;
        val.split(`href='`).forEach((val) => {
            link = val.split("'")[0]
        })
        name = val.split(`>`)[1].split(`</a>`)[0].replace('</a', "")
        

        todosOsLinks.push({name, link, linkPai: linkPai})
    })

    /*response.data.split("href='").forEach((val) => {
        todosOsLinks.push(val.split("'")[1])
    })

    response.data.split('href=`').forEach((val) => {
        todosOsLinks.push(val.split('`')[1])
    })

    */
    todosOsLinks.forEach((link) => {
        axios.get(link.link)
        .then(async (response) => {
            var arrSites = await sitesCadastrados.obtener('SITES')
            var igual = false;

            arrSites.forEach((val, i) => {
                if (!isHTML(link.name) && !link.name.includes("<") &&!link.name.includes(">")) {
                    if (val.link == link.link) {
                        var addKey = true;

                        arrSites[i].keys.forEach((val) => {
                            if (val.toString().trim().toLowerCase() == link.name.trim().toLowerCase()) {
                                addKey = false;
                            }
                        })

                        if (addKey) {
                            val.keys.push(link.name)
                            val.rel++
                            console.log('link ' + link.link + " editado!")
                            igual = true;
                        }
                    }
                }
            })
            
            if (!igual) {
                if (!isHTML(link.name) && !link.name.includes("<") &&!link.name.includes(">")) {
                    var linky = link.link
                    if(linky.startsWith("/")) {
                        linky.replace("/", "")
                        linky = link.linkPai + linky
                    }
                    arrSites.push({keys: link.name, link: linky, rel: 1})
                    console.log('link ' + link.link + " adicionado!")
                    var arrPreSites = await sitesCadastrados.obtener('PRESITES')
                    var add = true;
                    arrPreSites.forEach((e) => {
                        if (e.trim() == linky.split("/")[0]+"/".trim()) {
                            add = false;
                        }
                    }).catch(O_o => {})
                    console.log(add)
                    if (add) {
                        sitesCadastrados.set("PRESITES", arrPreSites)
                    }
                    valide(response, linky.split("/")[0]+"/")
                }
            }
            sitesCadastrados.set("SITES", arrSites)
        }).catch(O_o => {})
    })
    } catch (err) {
        1*1
    }
}

async function a() {
    var ind = 0;
    var aa = await sitesCadastrados.obtener('PRESITES')
    aa.forEach(async (val) => {
        axios.get(val)
        .then(async (r) => {
            valide(r, val);
        })

        ind++
    })
}

a()
