const FNR = {
    function: {
        execForum: (callback) => {
            document.addEventListener('forumReady', callback, false);
        },
        execDirectory: (callback) => {
            document.addEventListener('directoryReady', callback, false);
        },
    },
    forum: {
        getColors: () => {
            return Object.values(forumColours)
                .map((item) => {
                    return {
                        name: item.code,
                        hex: item.hex
                    }
                });
        },
        getTopics: async (exclusions, limit) => {
            const addContent = (elmt) => {
                const titleElmnt = $(elmt).find('.topictitle');
                const dateElmnt = $(elmt).children().last();

                finalArray.push({
                    name: titleElmnt.text().trim(),
                    url: Vue.filter('url-to-normal')(titleElmnt.attr('href')),
                    lastpost: {
                        url: Vue.filter('url-to-normal')(dateElmnt.children().last().attr('href')),
                        date: dateElmnt.text().split('por')[0].trim(),
                        who: {
                            name: dateElmnt.find('strong a').length ? dateElmnt.find('strong a').text().trim() : 'Invitado',
                            url: Vue.filter('url-to-normal')(dateElmnt.find('strong a').length ? dateElmnt.find('strong a').attr('href') : '/'),
                            color: dateElmnt.find('strong a').length ? dateElmnt.find('strong a span').attr('style').split('color:')[1] : 'initial',
                        },
                    },
                    forum: {
                        name: $(elmt).find('.row2 + .row2:not(.centered) a').text().trim(),
                        url: Vue.filter('url-to-normal')($(elmt).find('.row2 + .row2:not(.centered) a').attr('href')),
                    },
                });
            };

            const getPage = async (url) => {
                $.get(url, (data) => {
                    $(data).find('.ipbform').find('tbody').find('tr').each(function () {
                        if (finalArray.length < limit && exclusions.indexOf(parseInt($(this).find('.row2 + .row2:not(.centered) a').attr('href').split('/f')[1].split('-')[0])) === -1) {
                            addContent(this);
                        }
                    });

                    if (finalArray.length === limit || !$(data).find('.pagination')[0].children.length || $(data).find('.pagination').children().last()[0].localName === 'b') {
                        return finalArray;
                    } else {
                        return getPage($(data).find('.pagination').children().last().attr('href'));
                    }
                });
            };

            await getPage('/latest?change_version=invision');

            let finalArray = [];

            return finalArray;
        },
        getMembers: (option) => {
            return new Promise((resolve, reject) => {
                let members = [];

                const getUserData = (user, color) => {
                    return {
                        user: $(user).find('.membername span').text().trim(),
                        id: $(user).find('.popupmenu .popupmenu-item a').attr('href').split('?')[0],
                        img: $(user).find('.mini-avatar img').attr('src'),
                        color: color
                    };
                };

                const getUsersPage = (page) => {
                    let users = [];

                    $(page).find('.member-list .member').each(function () {
                        const group = FNR.utility.getGroup($(this).find('.membername span').attr('style').split('color:')[1]);

                        if (option) {
                            users.push(getUserData(this, group));
                        } else {
                            if (group !== 'unknown' && group !== forumConfig.skinOptions.adminGroup) {
                                users.push(getUserData(this, group));
                            }
                        }
                    });

                    return users;
                };

                const getPage = (url) => {
                    $.get(url, (data) => {
                        const nextURL = $(data).find('.pagination img[alt="Siguiente"]').parent().attr('href') || false;

                        members = members.concat(getUsersPage(data));

                        if (nextURL) {
                            getPage(nextURL);
                        } else {
                            resolve(members.sort((a, b) => {
                                if (a.user < b.user) return -1;
                                if (a.user > b.user) return 1;
                                return 0;
                            }));
                        }
                    });
                };

                getPage('/memberlist?change_version=invision');
            });
        },
        getGroups: (cache) => {
            const getData = () => {
                return new Promise((resolve, reject) => {
                    $.get('/groups?change_version=invision', (data) => {
                        let groups = [];

                        $(data).find('.group_list > li').each(function () {
                            const name = $(this).find('a').text().trim();

                            groups.push({
                                id: parseInt($(this).find('a').attr('href').split('/g')[1].split('-')[0]),
                                name,
                                color: $(this).find('a').css('color'),
                                url: forumConfig.profileUser.directoryFields === undefined ? Vue.filter('url-to-normal')($(this).find('a').attr('href')) : `/memberlist?group=${FNR.utility.genSlug(name)}`,
                                count: parseInt($(this).find('div > span').text()) - 1
                            });
                        });

                        resolve(groups);
                    });
                });
            };

            const readGroupsCache = () => {
                return new Promise((resolve, reject) => {
                    FNR.cache.useData('groups', cache).then(
                        (result) => {
                            resolve(result);
                        },
                        (err) => {
                            getData().then((data) => {
                                FNR.cache.setData('groups', data);

                                resolve(data);
                            });
                        }
                    );
                });
            };

            return readGroupsCache();
        },
        getAffiliates: () => {
            return new Promise((resolve, reject) => {
                const tops = forumConfig.affiliatesMax;

                const data = Object.entries(forumAffiliates).map((item) => {
                    let final = '';
                    const sizes = forumConfig.affiliatesSizes[item[0]];

                    item[1].forEach((item) => {
                        final += '<li><a href="' + item.url + '" title="' + item.title + '" target="_blank"><img src="' + item.img + '" alt="' + item.title + '" width="' + sizes.width + '" height="' + sizes.height + '"/></a></li>';
                    });

                    for (let i = 0; i < (tops[item[0]] - item[1].length); i++) {
                        final += '<li><a href="/" title="' + forumData.name + '"><img src="' + forumDefaults.affiliates[item[0]] + '" alt="' + forumData.name + '" width="' + sizes.width + '" height="' + sizes.height + '"/></a></li>';
                    }

                    return final;
                });

                resolve({
                    normal: data[0],
                    elite: data[1],
                    directory: data[2],
                    sister: data[3],
                });
            });
        },
    },
    content: {
        isAutosave: () => {
            if (document.post === undefined) return false;
            else return _userdata.user_id !== -1 && document.post.mode.value === 'reply' && document.post.t !== undefined
        },
        post: {
            getPost: (url) => {
                return new Promise((resolve, reject) => {
                    $.get(Vue.filter('url-to-invision')(url), (data) => {
                        const post = $(data).find("#p" + url.split("#")[1]);

                        resolve({
                            author: {
                                text: post.find(".author a").text(),
                                color: post.find(".author a span").css("color"),
                                url: Vue.filter('url-to-normal')(post.find(".author a").attr("href")),
                            },
                            content: post.find(".post-entry > div").html(),
                            date: post.find(".author").html().split("</a>")[1],
                        });
                    });
                });
            },
            genPost: (id, content) => {
                return new Promise((resolve, reject) => {
                    let save = document.createElement('iframe');

                    save.id = 'forum-save';
                    save.src = '/post?t=' + id + '&mode=reply&change_version=invision';
                    save.width = 0;
                    save.height = 0;
                    save.onload = () => {
                        saveDOM.onload = () => {
                            $('#forum-save').remove();

                            console.clear();

                            resolve(true);
                        };

                        $('#forum-save').contents().find('.subtitle:contains("Mensaje")').next().find('textarea').val(content);
                        $('#forum-save').contents().find('.formbuttonrow.center input[value="Enviar"]').click();
                    };

                    document.querySelector('body').prepend(save);

                    const saveDOM = document.querySelector('#forum-save');
                });
            },
        },
        topic: {
            getType: (src) => {
                const classes = [];

                if (src.indexOf('unread') > -1) {
                    classes.push('is-unread');
                } else {
                    classes.push('is-read');
                }

                if (src.indexOf('locked') > -1) {
                    classes.push('is-closed');
                } else if (src.indexOf('sticky') > 1) {
                    classes.push('is-sticky');
                } else if (src.indexOf('global_announce') > 1) {
                    classes.push('is-global-announcement');
                } else if (src.indexOf('announce') > 1) {
                    classes.push('is-announcement');
                }

                return classes;
            },
            genTopic: (id, name, content) => {
                return new Promise((resolve, reject) => {
                    let save = document.createElement('iframe');

                    save.id = 'forum-save';
                    save.src = '/post?f=' + id + '&mode=newtopic&change_version=invision';
                    save.width = 0;
                    save.height = 0;
                    save.onload = () => {
                        saveDOM.onload = () => {
                            $('#forum-save').remove();

                            console.clear();

                            resolve(true);
                        };

                        $('#forum-save').contents().find('dl dt:contains("Título del tema")').parent().find('input').val(name);
                        $('#forum-save').contents().find('.subtitle:contains("Mensaje")').next().find('textarea').val(content);
                        $('#forum-save').contents().find('.formbuttonrow.center input[value="Enviar"]').click();
                    };

                    document.querySelector('body').prepend(save);

                    const saveDOM = document.querySelector('#forum-save');
                });
            },
        }
    },
    user: {
        getUrl: (name) => {
            let character =
                name !== undefined ?
                    Object.keys(window.localStorage).filter(key => key.indexOf('userInfo') > -1 && window.localStorage[key].indexOf(`"name":"${name}"`) > -1).join().replace(`${forumData.prefix}_userInfo`, '') :
                    _userdata.user_id;

            if (character.length === 0) {
                character = encodeURIComponent(name).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
            }

            return "/profile?mode=viewprofile&u=" + character;
        },
        getLevel: async () => {
            switch (_userdata.user_level) {
                case 2:
                    return 'mod';
                case 1:
                    return 'admin';
                case 0:
                    return -1 == _userdata.user_id ? 'guest' : 'user';
            }
        },
        getGroup: async () => {
            const level = await FNR.user.getLevel();

            if (level === 'guest') {
                return 'unknown';
            }

            const { colour } = await FNR.user.getProfile(_userdata.user_id, .25);

            return colour;
        },
        getProfile: (name, time) => {
            const character = name != undefined ? FNR.user.getUrl(name) : FNR.user.getUrl();
            const cache = time || 5;

            const processData = (content) => {
                if (content.find('a').length) return Vue.filter('url-to-normal')(content.find('a').attr('href'));
                else if (content.find('table').length) return content.find('table').html();
                else if (content.find('img').length) return content.find('img').attr('src');
                else if (content.find('textarea').length) return content.find('textarea').val();
                else if (content.find('span').length) return content.find('span').text().trim();
                else if (content.text().trim() === '-') return '';
                else return content.text();
            };

            const getData = () => {
                return new Promise((resolve, reject) => {
                    $.get(character + '&change_version=invision', (data) => {
                        let user = {};

                        user['name'] = $(data).find('.maintitle h1 span').text().trim();
                        user['lastvisit'] = $(data).find('dt:contains("Última visita")').parent().find('dd').text();
                        user['colour'] = FNR.utility.getGroup($(data).find('.maintitle h1 span').css('color').replace('rgb(', 'rgb_').replace(/, /g, '_').replace(')', ''));
                        user['avatar'] = $(data).find('.real_avatar img').attr('src');

                        user['links'] = {
                            profile: '/u' + character.split('&u=')[1],
                            mp: '/privmsg?mode=post&u=' + character.split('&u=')[1],
                        };

                        user['messages'] = {
                            public: parseInt($(data).find('span:contains("Mensajes")').parent().parent().find('dd > div').text()) || 0,
                            private: parseInt($(data).find('dt:contains("Mensajes privados")').parent().find('dd').text()) || 0
                        };

                        user['fields'] = {};

                        $(data).find('dl[id^="field_id"]').each(function () {
                            if ($(this).find('dt span').text() !== '') {
                                if ($(this).find('dt span').text() === 'Mensajes') return;

                                user.fields[FNR.utility.genSlug($(this).find('dt span').text())] = {
                                    name: $(this).find('dt span').text(),
                                    content: processData($(this).find('dd .field_uneditable'))
                                }
                            }
                        });

                        $(data).find('.ipbform2 > dl').each(function () {
                            if ($(this).find('dt span').length && $(this).find('dt span').text() !== '') {
                                if ($(this).find('dt span').text() === 'Mensajes') return;

                                user.fields[FNR.utility.genSlug($(this).find('dt span').text())] = {
                                    name: $(this).find('dt span').text(),
                                    content: processData($(this).find('dd'))
                                }
                            }
                        });

                        user.fields['rango'] = {
                            name: 'Rango',
                            content: $(data).find('dt:contains("Rango:")').parent().find('dd').text()
                        }

                        resolve(user);
                    });
                });
            };

            const readUserCache = (id) => {
                const userId = `userInfo${id}`;

                return new Promise((resolve, reject) => {
                    FNR.cache.useData(userId, cache).then(
                        (result) => {
                            resolve(result);
                        },
                        (err) => {
                            getData().then((data) => {
                                FNR.cache.setData(userId, data);

                                resolve(data);
                            });
                        }
                    );
                });
            };

            return readUserCache(name);
        },
        changeAccount: async (out, username, password) => {
            try {
                await fetch(out);
                await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&autologin=1&login=1`
                })

                return true;
            } catch (error) {
                console.error('Error inesperado', error);
                return false;
            }
        },
        followed: {
            getPages: async () => {
                try {
                    const followedPage = await fetch('/search?search_id=watchsearch&change_version=invision');
                    const bodyFollowedPage = await followedPage.text();
                    const htmlFollowedPage = document.createElement('html');

                    htmlFollowedPage.innerHTML = bodyFollowedPage;

                    const total = htmlFollowedPage.querySelectorAll('.pagination a');
                    let arrayItems = [];

                    if (total.length) {
                        const finalPage = total[total.length - 2];
                        const finalPageUrl = finalPage.href.split(finalPage.origin)[1];
                        const finalPageNumberArray = finalPageUrl.match(/[0-9]/g) || [];
                        const finalPageNumber = parseInt(finalPageNumberArray.join('')) || 0;

                        const firstPage = total[1];
                        const firstPageUrl = firstPage.href.split(firstPage.origin)[1];
                        const firstPageNumberArray = firstPageUrl.match(/[0-9]/g) || [];
                        const firstPageNumber = parseInt(firstPageNumberArray.join('')) || 0;

                        const arrayPages = typeof finalPageNumber === 'undefined' ? 0 : finalPageNumber / firstPageNumber;
                        arrayItems = Array(arrayPages).fill(null).map((page, index) => `/search?search_id=watchsearch&start=${firstPageNumber * (index + 1)}&change_version=invision`);
                    }

                    return {
                        items: htmlFollowedPage.querySelectorAll('.ipbtable tbody tr td').length === 1 ? 0 : htmlFollowedPage.querySelectorAll('.ipbtable tbody tr').length,
                        pages: ['/search?search_id=watchsearch&change_version=invision', ...arrayItems],
                    }
                } catch (error) {
                    console.error('Error inesperado', error);
                    return false;
                }
            },
            getFollowed: async (page) => {
                try {
                    const followedPage = await fetch(page);
                    const bodyFollowedPage = await followedPage.text();
                    const htmlFollowedPage = document.createElement('html');

                    htmlFollowedPage.innerHTML = bodyFollowedPage;

                    return Array.from(htmlFollowedPage.querySelectorAll('.ipbtable tbody tr')).map(row => {
                        const cells = row.children;

                        return {
                            id: parseInt(cells[7].children[0].value),
                            name: cells[1].querySelector('.topictitle').textContent.trim(),
                            url: Vue.filter('url-to-normal')(cells[1].querySelector('.topictitle').href),
                            views: parseInt(cells[5].textContent),
                            replies: parseInt(cells[3].textContent),
                            type: FNR.content.topic.getType(cells[0].querySelector('img').src).join(' '),
                        }
                    });
                } catch (error) {
                    console.error('Error inesperado', error);
                    return false;
                }
            },
            delFollowed: async (topics) => {
                try {
                    await fetch('/search?search_id=watchsearch', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `confirm=confirm${topics.map(topic => `&mark${encodeURIComponent(`[]`)}2=${topic}`)}`
                    })

                    return true;
                } catch (error) {
                    console.error('Error inesperado', error);
                    return false;
                }
            },
        },
        drafts: {
            delDrafts: async (type, drafts) => {
                try {
                    const deleteType = type === 'draft' ? 'draft' : 'topic_draft';

                    await fetch(`/search?search_id=${type}search`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `confirm=confirm${drafts.map(draft => `&delete_${deleteType}${encodeURIComponent(`[${draft}]`)}=on`)}`
                    })

                    return true;
                } catch (error) {
                    console.error('Error inesperado', error);
                    return false;
                }
            },
            messages: {
                getPages: async () => {
                    try {
                        const draftsPage = await fetch('/search?search_id=draftsearch&change_version=invision');
                        const bodyDraftsPage = await draftsPage.text();
                        const htmlDraftsPage = document.createElement('html');

                        htmlDraftsPage.innerHTML = bodyDraftsPage;

                        const total = htmlDraftsPage.querySelectorAll('.pagination a');
                        let arrayItems = [];

                        if (total.length) {
                            const finalPage = total[total.length - 2];
                            const finalPageUrl = finalPage.href.split(finalPage.origin)[1];
                            const finalPageNumberArray = finalPageUrl.match(/[0-9]/g) || [];
                            const finalPageNumber = parseInt(finalPageNumberArray.join('')) || 0;

                            const firstPage = total[1];
                            const firstPageUrl = firstPage.href.split(firstPage.origin)[1];
                            const firstPageNumberArray = firstPageUrl.match(/[0-9]/g) || [];
                            const firstPageNumber = parseInt(firstPageNumberArray.join('')) || 0;

                            const arrayPages = typeof finalPageNumber === 'undefined' ? 0 : finalPageNumber / firstPageNumber;
                            arrayItems = Array(arrayPages).fill(null).map((page, index) => `/search?search_id=draftsearch&start=${firstPageNumber * (index + 1)}&change_version=invision`);
                        }

                        return {
                            items: htmlDraftsPage.querySelectorAll('.ipbtable tbody tr td').length === 1 ? 0 : htmlDraftsPage.querySelectorAll('.ipbtable tbody tr').length,
                            pages: ['/search?search_id=draftsearch&change_version=invision', ...arrayItems],
                        }
                    } catch (error) {
                        console.error('Error inesperado', error);
                        return false;
                    }
                },
                getDrafts: async (page) => {
                    try {
                        const draftsPage = await fetch(page);
                        const bodyDraftsPage = await draftsPage.text();
                        const htmlDraftsPage = document.createElement('html');

                        htmlDraftsPage.innerHTML = bodyDraftsPage;

                        return Array.from(htmlDraftsPage.querySelectorAll('.ipbtable tbody tr')).map(row => {
                            const cells = row.children;

                            return {
                                topic: {
                                    name: cells[1].textContent.trim(),
                                    url: Vue.filter('url-to-normal')(cells[1].querySelector('a').href)
                                },
                                info: {
                                    location: cells[2].textContent.trim(),
                                    date: cells[3].textContent.trim()
                                },
                                modify: Vue.filter('url-to-normal')(cells[4].querySelector('a').href)
                            }
                        });
                    } catch (error) {
                        console.error('Error inesperado', error);
                        return false;
                    }
                },
            },
            topics: {
                getPages: async () => {
                    try {
                        const draftsPage = await fetch('/search?search_id=topicdraftsearch&change_version=invision');
                        const bodyDraftsPage = await draftsPage.text();
                        const htmlDraftsPage = document.createElement('html');

                        htmlDraftsPage.innerHTML = bodyDraftsPage;

                        const total = htmlDraftsPage.querySelectorAll('.pagination a');
                        let arrayItems = [];

                        if (total.length) {
                            const finalPage = total[total.length - 2];
                            const finalPageUrl = finalPage.href.split(finalPage.origin)[1];
                            const finalPageNumberArray = finalPageUrl.match(/[0-9]/g) || [];
                            const finalPageNumber = parseInt(finalPageNumberArray.join('')) || 0;

                            const firstPage = total[1];
                            const firstPageUrl = firstPage.href.split(firstPage.origin)[1];
                            const firstPageNumberArray = firstPageUrl.match(/[0-9]/g) || [];
                            const firstPageNumber = parseInt(firstPageNumberArray.join('')) || 0;

                            const arrayPages = typeof finalPageNumber === 'undefined' ? 0 : finalPageNumber / firstPageNumber;
                            arrayItems = Array(arrayPages).fill(null).map((page, index) => `/search?search_id=topicdraftsearch&start=${firstPageNumber * (index + 1)}&change_version=invision`);
                        }

                        return {
                            items: htmlDraftsPage.querySelectorAll('.ipbtable tbody tr td').length === 1 ? 0 : htmlDraftsPage.querySelectorAll('.ipbtable tbody tr').length,
                            pages: ['/search?search_id=topicdraftsearch&change_version=invision', ...arrayItems],
                        }
                    } catch (error) {
                        console.error('Error inesperado', error);
                        return false;
                    }
                },
                getDrafts: async (page) => {
                    try {
                        const draftsPage = await fetch(page);
                        const bodyDraftsPage = await draftsPage.text();
                        const htmlDraftsPage = document.createElement('html');

                        htmlDraftsPage.innerHTML = bodyDraftsPage;

                        return Array.from(htmlDraftsPage.querySelectorAll('.ipbtable tbody tr')).map(row => {
                            const cells = row.children;

                            return {
                                topic: {
                                    name: cells[0].textContent.trim(),
                                    url: Vue.filter('url-to-normal')(cells[0].querySelector('a').href)
                                },
                                info: {
                                    location: cells[1].textContent.trim(),
                                    date: cells[2].textContent.trim()
                                },
                                modify: Vue.filter('url-to-normal')(cells[3].querySelector('a').href)
                            }
                        });
                    } catch (error) {
                        console.error('Error inesperado', error);
                        return false;
                    }
                },
            }
        },
        profile: {
            getData: (array) => {
                return new Promise((resolve, reject) => {
                    $.get('/profile?change_version=invision&mode=editprofile', (data) => {
                        const fields = data;

                        $.get('/profile?change_version=invision&mode=editprofile&page_profil=avatars', (data) => {
                            const avatar = data;

                            let result = [];

                            [].forEach.call(array, (item) => {
                                let value = '',
                                    options = [];

                                switch (item.type) {
                                    case 'input':
                                        value = $(fields).find('dl:contains("' + item.name + '")').find('dd').find('input').val();
                                        break;

                                    case 'textarea':
                                        value = $(fields).find('dl:contains("' + item.name + '")').find('dd').find('textarea').val();
                                        break;

                                    case 'select':
                                        value = $(fields).find('dl:contains("' + item.name + '")').find('dd').find('select option:selected').attr('value');

                                        $(fields).find('dl:contains("' + item.name + '")').find('dd').find('select option').each(function () {
                                            if ($(this).attr('value') === '') return;

                                            options.push({
                                                name: $(this).text(),
                                                value: $(this).attr('value')
                                            });
                                        });
                                        break;

                                    case 'avatar':
                                        value = $(avatar).find('.box-content img').attr('src');
                                        break;
                                }

                                if (item.type === 'select' && value === undefined || item.type === 'select' && value === '') return;

                                let final = {
                                    type: item.type,
                                    name: item.name,
                                    value: value
                                };

                                if (item.validation) {
                                    final.validation = item.validation;
                                }

                                if (options.length) {
                                    final.options = options;
                                }

                                result.push(final);
                            });

                            resolve(result);
                        });
                    });
                });
            },
            setData: (array) => {
                return new Promise((resolve, reject) => {
                    const resolveSetter = () => {
                        $('#forum-save').remove();

                        console.clear();

                        resolve(true);
                    };

                    let save = document.createElement('iframe');

                    save.id = 'forum-save';
                    save.src = '/profile?change_version=invision&mode=editprofile';
                    save.width = 0;
                    save.height = 0;
                    save.onload = () => {
                        let avatar = false;

                        [].forEach.call(array, (item) => {
                            switch (item.type) {
                                case 'input':
                                    $('#forum-save').contents().find('dl:contains("' + item.name + '")').find('dd').find('input').first().val(item.value);
                                    break;

                                case 'textarea':
                                    $('#forum-save').contents().find('dl:contains("' + item.name + '")').find('dd').find('textarea').val(item.value);
                                    break;

                                case 'select':
                                    $('#forum-save').contents().find('dl:contains("' + item.name + '")').find('dd').find('select option[value="' + item.value + '"]').attr('selected', 'selected');
                                    break;

                                case 'avatar':
                                    avatar = item.value;
                                    break;
                            }
                        });

                        saveDOM.onload = () => {
                            if (!avatar) {
                                resolveSetter();
                            } else {
                                saveDOM.onload = () => {
                                    saveDOM.onload = () => {
                                        resolveSetter();
                                    }

                                    $('#forum-save').contents().find('input[name="avatarremoteurl"]').val(avatar);
                                    $('#forum-save').contents().find('input[type="submit"][value="Registrar"]').click();
                                }

                                saveDOM.src = '/profile?change_version=invision&mode=editprofile&page_profil=avatars';
                            }
                        };

                        $('#forum-save').contents().find('input[type="submit"][value="Registrar"]').click();
                    };

                    document.querySelector('body').prepend(save);

                    const saveDOM = document.querySelector('#forum-save');
                });
            }
        }
    },
    cache: {
        getData: (id) => {
            if (localStorage.getItem(forumData.prefix + '_' + id) === null) return false;
            else return JSON.parse(localStorage.getItem(forumData.prefix + '_' + id)).content;
        },
        setData: (id, data, time) => {
            let cur_date = time === -1 ? 'undefined' : new Date().getTime();

            localStorage.setItem(
                forumData.prefix + '_' + id,
                JSON.stringify({
                    cached_at: cur_date,
                    content: data,
                })
            );
        },
        delData: (id) => {
            if (localStorage.getItem(forumData.prefix + '_' + id) === null) return false;
            else return localStorage.removeItem(forumData.prefix + '_' + id);
        },
        useData: async (id, time) => {
            const item = localStorage.getItem(forumData.prefix + '_' + id);
            const cur_date = new Date();
            const timeMil = time == -1 ? 'undefined' : time * 86400000;

            if ((item != null && time == -1) || (item != null && parseInt(JSON.parse(item).cached_at) + timeMil > cur_date.getTime())) {
                return JSON.parse(item).content;
            } else {
                return Promise.reject(false);
            }
        },
    },
    utility: {
        genSlug: (text, alt) => {
            const slug = (Q) => {
                const R = '\xE0\xE1\xE4\xE2\xE8\xE9\xEB\xEA\xEC\xED\xEF\xEE\xF2\xF3\xF6\xF4\xF9\xFA\xFC\xFB\xF1\xE7\xB7/_,:;';
                Q = Q.trim().toLowerCase();
                for (var T = 0, U = R.length; T < U; T++) Q = Q.replace(new RegExp(R.charAt(T), 'g'), 'aaaaeeeeiiiioooouuuunc------'.charAt(T));
                return Q.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            };

            const replace = alt || '_';

            return slug(text).replace(/-/g, replace);
        },
        genArray: (string) => {
            return JSON.parse(string.replace(/`/g, '"'));
        },
        genValidation: (array) => {
            let final = '';

            [].forEach.call(array, (item) => {
                switch (item.validation) {
                    case 'hex':
                        if (!item.value.match(/^#[a-f0-9]{6}$/i)) {
                            final += '<li>El campo de ' + item.name.toLowerCase() + ' debe incluir un código de color hexadecimal.</li>';
                        }
                        break;

                    case 'img':
                        if (!item.value.match(/(jpg|jpeg|png)$/i)) {
                            final += '<li>El campo de ' + item.name.toLowerCase() + ' debe ser el enlace a una imagen (formato png, jpg o jpeg).</li>';
                        }
                        break;
                }
            });

            return final;
        },
        getGroup: (color) => {
            const returnHexVer = (code) => {
                let status = 'unknown';

                Object.values(forumColours).map((item) => {
                    if (item.hex === code.toLowerCase()) status = FNR.utility.genSlug(item.code);
                });

                return status;
            };

            const returnIdVer = (code) => {
                let status = 'unknown';

                Object.values(forumColours).map((item) => {
                    if (item.id === code) status = FNR.utility.genSlug(item.code);
                });

                return status;
            };

            if (color === undefined) return 'unknown';
            else if (color.indexOf('#') > -1) return returnHexVer(color);
            else if (color.indexOf('id_') > -1) return returnIdVer(parseFloat(color.split('_')[1]));
            else if (forumColours[color] === undefined) return 'unknown';
            else return FNR.utility.genSlug(forumColours[color].code);
        }
    },
    html: {
        genModal: (title, content, buttons) => {
            if (title === '' || title === undefined || title === null) return;
            if (content === '' || content === undefined || content === null) return;

            let modal = document.createElement('div');

            modal.id = 'forum-modal';

            document.body.appendChild(modal);

            let final = '';

            final += '<div id="' + FNR.utility.genSlug(title, '-') + '" class="modal-element">';
            final += '<div class="modal-title">';
            final += '<h3>' + title + '</h3>';
            final += '<a onclick="document.querySelector(`#forum-modal`).remove()">';
            final += '<i class="fas fa-times"></i>';
            final += '</a>';
            final += '</div>';
            final += '<div class="modal-content">';
            final += '<div class="is-content">';
            final += content.replace(/\n/g, '<br>');
            final += '</div>';

            if (buttons !== '' && buttons !== undefined && buttons !== null) {
                final += '<div class="modal-buttons">';
                final += buttons;
                final += '</div>';
            }

            final += '</div>';
            final += '</div>';

            final += '<div class="is-bgmodal bg-active" onclick="document.querySelector(`#forum-modal`).remove()"></div>';

            document.querySelector('#forum-modal').innerHTML = final;
        },
        genPrompt: (title, content, placeholder, text) => {
            if (title === '' || title === undefined || title === null) return;
            if (content === '' || content === undefined || content === null) return;

            return new Promise((resolve, reject) => {
                FNR.html.genModal(title, '<p>' + content + '</p><p><input id="modal-prompt" type="text" placeholder="' + placeholder + '" value="' + text + '"></p>', '<button id="modal-button-enter" class="button1 btn-main">Confirmar</button><button id="modal-button-cancel" class="button1">Cancelar</button>');

                document.querySelector('#modal-button-enter').onclick = () => {
                    const result = document.querySelector('#modal-prompt').value;

                    if (result === '') {
                        resolve(false);
                    } else {
                        resolve(result);
                    }

                    document.querySelector(`#forum-modal`).remove();
                };

                document.querySelector('#modal-button-cancel').onclick = () => {
                    reject(false);
                    document.querySelector(`#forum-modal`).remove();
                };

                document.querySelector('.modal-title a').onclick = () => {
                    reject(false);
                    document.querySelector(`#forum-modal`).remove();
                };

                document.querySelector('.is-bgmodal.bg-active').onclick = () => {
                    reject(false);
                    document.querySelector(`#forum-modal`).remove();
                };
            });
        },
        genNotification: (title, content, icon, url) => {
            if (title === '' || title === undefined || title === null) return;
            if (content === '' || content === undefined || content === null) return;
            if (content.length > 50) return;
            if (icon === '' || icon === undefined || icon === null) return;

            if (document.querySelectorAll('forum-notification').length) {
                document.querySelector('#forum-notification').remove();
                clearTimeout();
            }

            let notification = document.createElement('div');

            notification.id = 'forum-notification';

            document.body.appendChild(notification);

            let final = '';

            if (url === '' || url === undefined || url === null) {
                final += '<div id="' + FNR.utility.genSlug(title, '-') + '"  class="notification-element" onclick="document.querySelector(`#forum-notification`).classList.remove(`notification-show`)" >';
            } else {
                final += '<a href="' + url + '" id="' + FNR.utility.genSlug(title, '-') + '"  class="notification-element" onclick="document.querySelector(`#forum-notification`).classList.remove(`notification-show`)" >';
            }

            final += '<div class="notification-icon">';
            final += '<i class="' + icon + '"></i>';
            final += '</div>';
            final += '<div class="notification-content">';
            final += '<h3>' + title + '</h3>';
            final += '<p>' + content + '</p>';
            final += '</div>';
            final += '<div class="notification-controls">';
            final += '<i class="fas fa-times"></i>';
            final += '</div>';

            if (url === '' || url === undefined || url === null) {
                final += '</div>';
            } else {
                final += '</a>';
            }

            document.querySelector('#forum-notification').innerHTML = final;

            setTimeout(() => {
                document.querySelector(`#forum-notification`).classList.add('notification-show');
            }, 250);

            setTimeout(() => {
                document.querySelector(`#forum-notification`).classList.remove('notification-show');
            }, 8000);

            setTimeout(() => {
                document.querySelector(`#forum-notification`).remove();
            }, 10000);
        }
    },
    behaviour: {
        genWiki: () => {
            if (document.querySelector('.wiki-cascade')) {
                [].forEach.call(document.getElementsByClassName('wiki-cascade'), (item) => {
                    item.onclick = () => {
                        const element = item.parentElement.parentElement;

                        if (element.classList.contains('is-active')) {
                            element.classList.remove('is-active');
                        } else {
                            element.classList.add('is-active');
                        }
                    };
                });
            }

            if (document.querySelector('.wiki-controls .router-link-active')) {
                [].forEach.call(document.querySelectorAll('.wiki-controls .router-link-active'), (item) => {
                    if (!item.parentElement.parentElement.parentElement.parentElement.parentElement.classList.contains('wiki-index')) {
                        const setActive = (element, isFirst) => {
                            let parentElement = element.parentElement.parentElement;

                            if (isFirst) {
                                parentElement = parentElement.parentElement.parentElement;
                            }

                            parentElement.classList.add('is-active');
                            parentElement.classList.add('is-selected');

                            if (!parentElement.parentElement.parentElement.parentElement.classList.contains('wiki-index')) {
                                setActive(parentElement, false);
                            }
                        };

                        setActive(item, true);
                    }
                });
            }

            if (document.querySelector('aside.wiki-index > .select-container > select')) {
                document.querySelector('aside.wiki-index > .select-container > select').onchange = () => {
                    router.push(document.querySelector('aside.wiki-index > .select-container > select').value);
                };
            }
        },
        genDropeable: () => {
            if (document.querySelector('.is-dropeable')) {
                [].forEach.call(document.getElementsByClassName('is-dropeable'), (item) => {
                    item.onclick = () => {
                        if (!item.classList.contains('is-active')) {
                            [].forEach.call(document.getElementsByClassName('is-dropeable'), (drops) => {
                                drops.classList.remove('is-active');
                            });

                            item.classList.add('is-active');
                        } else {
                            item.classList.remove('is-active');
                        }
                    };
                });
            }
        },
        genControls: () => {
            if (document.querySelector('.forum-controls')) {
                [].forEach.call(document.querySelectorAll('.forum-controls'), (control) => {
                    let children = 0;

                    [].forEach.call(control.children, (item) => {
                        if (window.getComputedStyle(item, null).display === 'none') {
                            return;
                        }

                        children += item.children.length;
                    });

                    if (children === 0 && control.classList.contains('not-show') === false) {
                        control.classList.add('not-show');
                    }
                });
            }
        },
        genDebounce: (func, timeout = 750) => {
            let timer;

            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        },
        genMeassure: () => {
            [].forEach.call(document.querySelectorAll('.is-tweakeable'), (item) => {
                if (!item.clientHeight || !item.querySelector('.is-measurable')) return;

                if (item.style.fontSize) {
                    item.style.removeProperty('font-size');
                }
                
                const width = item.offsetWidth - parseFloat(window.getComputedStyle(item, null).paddingLeft) - parseFloat(window.getComputedStyle(item, null).paddingRight) - parseFloat(window.getComputedStyle(item, null).borderLeftWidth) - parseFloat(window.getComputedStyle(item, null).borderRightWidth);

                if (width > 0 && item.querySelector('.is-measurable').offsetWidth > 0) {
                    let size = parseFloat(window.getComputedStyle(item, null).fontSize);

                    while (width < item.querySelector('.is-measurable').offsetWidth) {
                        item.style.fontSize = size + 'px';
                        size--;
                    }
                }
            });
        }
    }
};