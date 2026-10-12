console.log(
    '%cFNR Engine por %c@jimboclowncoder 🏳️‍🌈',
    'font-family: sans-serif; font-size: 1.5em',
    'font-size: 1.5em; text-transform: uppercase; font-weight: 800; color: #c381b9;'),
    console.log('https://jimboclowncoder.tumblr.com/');

/* GENERAL */
document.addEventListener('DOMContentLoaded', async () => {
    const [level, group] = await Promise.all([FNR.user.getLevel(), FNR.user.getGroup()]);
    const screen = window.screen.width <= 1023 ? 'touch' : 'desktop';

    document.body.classList.add(`is-${screen}`);
    document.body.classList.add(`is-${level}`);
    document.body.classList.add(`is-${group}`);

    if (level !== 'guest') {
        document.body.classList.add(`is-user${_userdata.user_id}`);
    }
});

/* BLOQUE DE FORO */
/* Autor de los posts */
document.addEventListener('DOMContentLoaded', () => {
    if (_userdata.user_id === -1 && document.querySelector('.lastpost-content')) {
        [].forEach.call(document.querySelectorAll('.lastpost-content'), (item) => {
            let element;
            let separated;
            let author;

            if (item.querySelector('.color-groups')) {
                element = item.querySelector('.color-groups');
                separated = element.outerHTML.split(element.innerHTML);
                author = element.textContent.trim();

                element.outerHTML = '<strong><a href="' + FNR.user.getUrl(author) + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + author + '»">' + separated[0] + Vue.filter('just-name')(author) + separated[1] + '</a></strong>';

                if (item.querySelector('.lastpost-link')) {
                    item.querySelector('.lastpost-link').title += author;
                }
            } else {
                item.querySelector('.forum-last-author').innerHTML = '<strong>Invitado</strong>';

                if (item.querySelector('.lastpost-link')) {
                    item.querySelector('.lastpost-link').title += 'Invitado';
                }
            }

            item.querySelector('.forum-last-author').outerHTML = item.querySelector('.forum-last-author > strong').outerHTML;
        });
    } else if (_userdata.user_id !== -1 && document.querySelector('.lastpost-content')) {
        [].forEach.call(document.querySelectorAll('.lastpost-content'), (item) => {
            let author = '<strong>Invitado</strong>';

            if (item.querySelector('.forum-last-author > strong')) {
                author = item.querySelector('.forum-last-author > strong > a');
                author.title = 'Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + author.textContent.trim() + '»';

                if (item.querySelector('.lastpost-link')) {
                    item.querySelector('.lastpost-link').title += author.textContent.trim();
                }

                author.querySelector('span').textContent = Vue.filter('just-name')(author.textContent.trim());
                author = '<strong>' + author.outerHTML + '</strong>';
                author.textContent = Vue.filter('just-name')(author.textContent);
            } else {
                if (item.querySelector('.lastpost-link')) {
                    item.querySelector('.lastpost-link').title += 'Invitado';
                }
            }

            item.querySelector('.forum-last-author').outerHTML = author;
        });
    }
});

/* Fecha de los posts */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.forum-last-date')) {
        [].forEach.call(document.querySelectorAll('.lastpost-content'), (item) => {
            const date = item.querySelector('.forum-last-date').textContent;

            item.querySelector('.lastpost-link').title += ', ' + date;

            item.querySelector('.forum-last-date').outerHTML = date;

            item.outerHTML = item.innerHTML;
        });
    }
});

/* BLOQUE DE LISTADO DE TEMAS */
/* Estado y tipo de tema */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.topiclist-topics li:not(.is-not-topic)')) {
        [].forEach.call(document.querySelectorAll('.topiclist-topics li:not(.is-not-topic)'), (item) => {
            [].forEach.call(FNR.content.topic.getType(item.querySelector('.topiclist-topic .to-process .topic-status').textContent), (type) => {
                item.classList.add(type);
            });
        });
    }
});

/* Autor del tema */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.topic-creator')) {
        [].forEach.call(document.querySelectorAll('.topic-creator'), (item) => {
            if (item.querySelector('span')) {
                if (!item.querySelector('a')) {
                    item.innerHTML = '<strong><a href="' + FNR.user.getUrl(item.textContent) + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + item.textContent.trim() + '»">' + item.innerHTML + '</a></strong>';
                } else {
                    item.querySelector('a').title = 'Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + item.textContent.trim() + '»';
                    item.innerHTML = '<strong>' + item.innerHTML + '</strong>';
                }

                item.querySelector('span').innerHTML = Vue.filter('just-name')(item.textContent.trim());
            } else {
                item.innerHTML = '<strong>Invitado</strong>';
            }

            item.outerHTML = item.innerHTML;
        });
    }
});

/* Paginación del tema */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.topic-pagination')) {
        [].forEach.call(document.querySelectorAll('.topic-pagination'), (item) => {
            if (item.querySelector('strong')) {
                item.classList.remove('to-process');
            }
        });
    }
});

/* Ultimo mensaje */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.topiclist-topics li:not(.is-not-lastpost)')) {
        [].forEach.call(document.querySelectorAll('.topiclist-topics li:not(.is-not-lastpost)'), (item) => {
            const author = item.querySelector('.topiclist-topic .to-process .lastpost-author');
            const url = item.querySelector('.topiclist-topic .to-process .lastpost-link a').href;
            const date = item.querySelector('.topiclist-topic .to-process .lastpost-date').textContent;
            let profile = FNR.user.getUrl(author.textContent);

            if (author.querySelector('.gensmall')) {
                profile = author.querySelector('.gensmall').href;
            }

            item.querySelector('.topic-lastpost').href = url;
            item.querySelector('.topic-lastpost').title = 'Último mensaje por ' + author.textContent.trim() + ', ' + date;

            if (item.querySelector('.topic-lastauthor')) {
                const lastAuthor = item.querySelector('.topic-lastauthor');

                if (author.querySelector('span')) {
                    author.innerHTML = '<strong><a href="' + profile + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + author.textContent.trim() + '»">' + author.querySelector('span').outerHTML + '</a></strong>';
                    author.querySelector('strong strong').textContent = Vue.filter('just-name')(author.querySelector('strong strong').textContent.trim());
                    author.querySelector('.color-groups').innerHTML = author.querySelector('.color-groups').textContent;

                    lastAuthor.outerHTML = author.innerHTML;
                } else {
                    lastAuthor.outerHTML = '<strong>Invitado</strong>';
                }

                lastAuthor.outerHTML = lastAuthor.innerHTML;
            }

            if (item.querySelector('.topic-lastdate')) {
                item.querySelector('.topic-lastdate').outerHTML = date;
            }

            if (item.querySelector('.topic-lastavatar')) {
                let html;

                html = '';

                html += '<a class="topic-lastavatar" href="' + profile + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + author.textContent.trim() + '»">';
                html += item.querySelector('.topic-lastavatar').innerHTML;
                html += '</a>';

                item.querySelector('.topic-lastavatar').outerHTML = html;
            }
        });
    }
});

/* Moderar foros */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#moderation') && document.querySelector('#moderation a')) {
        document.querySelector('a[href="#gestionar"]').href = document.querySelector('#moderation a').href;
    } else if (document.querySelector('#moderation')) {
        document.querySelector('a[href="#gestionar"]').parentElement.remove();
    }
});

/* BLOQUE DE EDICIÓN DE MENSAJE */
/* Previsualización de mensaje */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.prev-post')) {
        let item = document.querySelector('#forum-preview');

        if (document.querySelectorAll('.prev-post')[0].innerHTML !== '') {
            item.querySelector('.post-content').innerHTML = '<div class="is-content">' + document.querySelectorAll('.prev-post')[0].innerHTML + '</div>';
            item.classList.remove('to-process');
        }
    }
});

/* Otros temas */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.forum-otherposts') && document.querySelector('.forum-otherposts').children.length) {
        let final = '';

        [].forEach.call(document.querySelector('.forum-otherposts').querySelectorAll('.post'), (item) => {
            if (document.querySelector('.mp-main') && document.querySelector('#forum-reply')) {
                let author = item.querySelector('.mp-from').textContent,
                    group = FNR.utility.getGroup('rgb_' + item.querySelector('.mp-from > span').style.color.split('rgb(')[1].split(')')[0].replace(/, /g, '_')),
                    date = item.querySelector('.mp-date').textContent,
                    content = item.querySelector('.is-content').innerHTML;

                final += '<li class="post post-mp">';
                final += '<section class="postlist-post usergroup-' + group + '">';
                final += '<ul class="post-datafields post-profile profile-sticky">';
                final += '<li class="datafield-user">';
                final += '<div class="datafield-name">Usuario</div>';
                final += '<strong><a href="' + FNR.user.getUrl(author) + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + author + '»">' + author + '</a></strong>';
                final += '</li>';
                final += '<li class="datafield-date">';
                final += '<div class="datafield-name">Fecha</div>';
                final += (date.indexOf('el') > -1 ? date.split('el ')[1] : date);
                final += '</li>';
                final += '</ul>';
                final += '<div class="post-content no-links">';
                final += '<div class="is-content">';
                final += content;
                final += '</div>';
                final += '</div>';
                final += '</section>';
                final += '</li>';
            } else if (!document.querySelector('#mp-body')) {
                if (item.querySelector('.post-datafields .datafield-user a > span')) {
                    item.querySelector('.postlist-post').classList.add('usergroup-' + FNR.utility.getGroup('rgb_' + item.querySelector('.post-datafields .datafield-user a > span').style.color.split('rgb(')[1].split(')')[0].replace(/, /g, '_')));

                    item.querySelector('.post-datafields .datafield-user a').title = 'Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + item.querySelector('.post-datafields .datafield-user a').textContent + '»';

                    if (item.querySelector('.post-datafields .datafield-user a').href === '') {
                        item.querySelector('.post-datafields .datafield-user a').href = FNR.user.getUrl(item.querySelector('.post-datafields .datafield-user a').textContent);
                    }
                } else if (item.querySelector('.post-datafields .datafield-check') && item.querySelector('.post-datafields .datafield-check').children && item.querySelector('.post-datafields .datafield-check').children.length === 1) {
                    item.querySelector('.post-datafields .datafield-check').remove();
                } else if (item.querySelector('.post-datafields .datafield-user a') && item.querySelector('.post-datafields .datafield-user a').href === '') {
                    item.querySelector('.post-datafields .datafield-user a').outerHTML = '<strong>' + item.querySelector('.post-datafields .datafield-user a').innerHTML + '</strong>';

                    item.querySelector('.postlist-post').classList.add('usergroup-' + FNR.utility.getGroup('null'));
                }

                if (item.querySelector('.post-datafields .datafield-user').textContent === 'UsuarioAnonymous') {
                    item.querySelector('.postlist-post').classList.add('usergroup-' + FNR.utility.getGroup('null'));
                }
            };
        });

        if (document.querySelector('.mp-main') && document.querySelector('#forum-reply')) {
            document.querySelector('.forum-otherposts').innerHTML = final;
        }
    }
});

/* BLOQUE DE TEMA */
/* Botones de post */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.forum-postlist .post:not(.panel)')) {
        const equivalences = {
            'responder_citando': {
                icon: 'fas fa-quote-right',
                title: 'Citar'
            },
            'editar_borrar_este_mensaje': {
                icon: 'fas fa-pencil-alt',
                title: 'Editar'
            },
            'borrar_este_mensaje': {
                icon: 'fas fa-trash-alt',
                title: 'Borrar'
            },
            'ver_la_direccion_ip_del_autor': {
                icon: 'fas fa-map-marker-alt',
                title: 'Ver IP'
            },
            'permalink': {
                icon: 'fas fa-tag',
                title: 'Enlace permanente'
            },
        };

        [].forEach.call(document.querySelectorAll('.forum-postlist .post'), (item) => {
            if (item.children.length > 1) {
                let html = '';

                [].forEach.call(item.querySelectorAll('.to-process .post-icons li a'), (button) => {
                    const eq = equivalences[FNR.utility.genSlug(button.querySelector('img').title)];

                    html += '<li class="post-button post-button-' + FNR.utility.genSlug(eq.title, '-') + '">';
                    html += '<a title="' + eq.title + '" href="' + button.href + '">';
                    html += '<i class="' + eq.icon + '"></i>';
                    html += '<span>' + (eq.title === 'Enlace permanente' ? 'Permalink' : eq.title) + '</span>';
                    html += '</a>';
                    html += '</li>';
                });

                item.querySelector('.post-buttons').innerHTML = html;
            } else {
                item.remove();
            }
        });
    }
});

/* Edición rápida */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#forum-realreply') !== null && document.querySelector('#forum-realreply').innerHTML === '') {
        document.querySelector('#quickreply-section').remove();
    }
});

/* BLOQUE DE MP */
/* Botones de cita y editar */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('img[title="Citar mensaje"]')) {
        [].forEach.call(document.querySelectorAll('img[title="Citar mensaje"]'), (item) => {
            let link = item.parentElement;

            link.title = 'Citar el Mensaje';
            link.classList.add('dropdown-item');
            link.textContent = 'Citar el Mensaje';
        });
    }

    if (document.querySelector('img[title="Editar mensaje"]')) {
        [].forEach.call(document.querySelectorAll('img[title="Editar mensaje"]'), (item) => {
            let link = item.parentElement;

            link.title = 'Editar el Mensaje';
            link.classList.add('dropdown-item');
            link.textContent = 'Editar el Mensaje';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.mp-from')) {
        [].forEach.call(document.querySelectorAll('.mp-from'), (item) => {
            const color = FNR.utility.getGroup(item.querySelector('span').style.color.replace(/, /g, '_').replace(/, /g, '_').replace(/\(/g, '_').replace(/\)/g, ''));

            item.innerHTML = '<a href="' + FNR.user.getUrl(item.textContent) + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + item.textContent + '»">' + item.textContent + '</a>';

            let element = item.parentElement;

            while (!element.classList.contains('mp-main')) {
                element = element.parentElement;
            };

            element.classList.add('usergroup-' + color);
        });
    }
});

/* GENERAL */
/* Breadcumbs */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#breadcrumbs') && document.querySelector('#forum-breadcrumb')) {
        [].forEach.call(document.querySelector('#breadcrumbs').children, (item, index, arr) => {
            let url = item.href,
                text = Vue.filter('mini-sanitize')(item.text),
                special = '';

            if (url.match(/c(\d+)-/) || (index + 1) === arr.length) {
                url = ((index + 1) === arr.length ? window.location.pathname + window.location.search : '#');
                special += ' class="is-hidden-touch' + ((index + 1) === arr.length ? '' : ' is-active') + '"';
            } else if (url.indexOf('#profile') > -1) {
                url = FNR.user.getUrl(text);
            }

            document.querySelector('#forum-breadcrumb ul').innerHTML += '<li' + special + '><a href="' + url + '" title="Ir a «' + text + '»">' + text + '</a></li>';
        });
    }
});

/* Botones */
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelector('#buttons');

    if (buttons && buttons.children.length) {
        [].forEach.call(document.querySelectorAll('.page-buttons'), (item) => {
            item.insertAdjacentHTML('afterbegin', buttons.innerHTML);

            if (item.parentElement.classList.contains('not-show')) {
                item.parentElement.classList.remove('not-show');
            }
        });
    }
});

/* Paginación */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#pagination') && document.querySelector('#pagination').children.length) {
        const getPageInfo = () => {
            const pageLinks = Array.from(document.querySelectorAll('#pagination > span > *:not(.pag-img):not(.page-sep)'));

            if (!pageLinks.length) {
                return {
                    currentPage: 1,
                    totalPages: 1,
                }
            }

            return {
                currentPage: parseInt(document.querySelector('#pagination > span > strong').textContent),
                totalPages: parseInt(pageLinks[pageLinks.length - 1].textContent),
            }
        }

        const pageData = getPageInfo();
        const leftButton = document.querySelector('.pag-img .sprite-arrow_prosilver_left');
        const rightButton = document.querySelector('.pag-img .sprite-arrow_prosilver_right');

        if (leftButton) {
            leftButton.parentElement.title = 'Ir a la página anterior';
            leftButton.parentElement.classList.add('page-prev');
            leftButton.parentElement.classList.remove('pag-img');
            leftButton.parentElement.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }

        if (rightButton) {
            rightButton.parentElement.title = 'Ir a la página siguiente';
            rightButton.parentElement.classList.add('page-next');
            rightButton.parentElement.classList.remove('pag-img');
            rightButton.parentElement.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }

        const nextPage = document.querySelector('.page-next');
        const prevPage = document.querySelector('.page-prev');

        const pagination = `
            <div class="pagination-manager">
                ${(prevPage === null ? '' : `<div class="page-action">${prevPage.outerHTML}</div>`)}
                <form class="pagination-input" name="go_page">
                    <input type="text" placeholder="${pageData.currentPage}" />de ${pageData.totalPages}
                </form>
                ${(nextPage === null ? '' : `<div class="page-action">${nextPage.outerHTML}</div>`)}
            </div>
        `;

        [].forEach.call(document.querySelectorAll('.page-pagination'), (item) => {
            item.insertAdjacentHTML('afterbegin', pagination);

            const formSelector = item.querySelector('.pagination-input');
            const inputSelector = item.querySelector('.pagination-input input');

            inputSelector.onkeyup = FNR.behaviour.genDebounce(() => {
                if (inputSelector.value.match(/[a-zA-Z]+/g) === null && inputSelector.value.trim() !== '') {
                    eval(do_pagination_start.toString().replace('document.go_page.start.value', 'inputSelector.value').split('{')[1].split('}')[0]);
                }
            })

            if (item.parentElement.classList.contains('not-show')) {
                item.parentElement.classList.remove('not-show');
            }
        });
    }
});

/* Contenido de los mensajes */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.codebox')) {
        [].forEach.call(document.querySelectorAll('.codebox'), (item) => {
            if (item.classList.length !== 1) {
                item.classList.remove('codebox');
            }
        });
    }

    if (document.querySelector('.codebox')) {
        [].forEach.call(document.querySelectorAll('.codebox'), (item) => {
            const code = item.querySelector('code').innerHTML.trim();

            item.querySelector('dt').innerHTML = 'Código <em>-</em> <span class="is-pointer">Copiar</span>';
            item.insertAdjacentHTML('afterbegin', '<div class="adminbox-icon"><i class="fas fa-code"></i></div>');
            item.querySelector('code').remove();
            item.insertAdjacentHTML('beforeend', '<code>' + code + '</code>');
        });
    }

    if (document.querySelector('.spoiler')) {
        [].forEach.call(document.querySelectorAll('.spoiler'), (item) => {
            item.querySelector('dt').innerHTML = item.querySelector('dt').innerHTML.slice(0, -1);
            item.insertAdjacentHTML('afterbegin', '<div class="adminbox-icon"><i class="fas fa-archive"></i></div>');
        });
    }

    if (document.querySelector('.hidecode')) {
        [].forEach.call(document.querySelectorAll('.hidecode'), (item) => {
            item.insertAdjacentHTML('afterbegin', '<div class="adminbox-icon"><i class="fas fa-eye-slash"></i></div>');
        });
    }

    if (document.querySelector('blockquote')) {
        [].forEach.call(document.querySelectorAll('blockquote cite'), (item) => {
            item.innerHTML = item.innerHTML.replace(/escribió:/g, '');

            if (item.querySelector('a')) {
                const who = item.querySelector('a');

                who.title = 'Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + who.title.replace(/Ver el perfil :: /g, '') + '»';
            }

            item = item.innerHTML;
        });

        [].forEach.call(document.querySelectorAll('blockquote'), (item) => {
            item.insertAdjacentHTML('afterbegin', '<div class="adminbox-icon"><i class="fas fa-quote-right"></i></div>');
        });
    }
});

/* Convertir confirmación de catchap en formulario */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#is-form') && document.querySelector('.msg-element')) {
        const content = document.querySelector('#is-form').innerHTML;
        const form = {
            method: document.querySelector('.basic-element form').method,
            action: document.querySelector('.basic-element form').action,
            name: document.querySelector('.basic-element form').name
        };

        document.querySelector('#message-section').outerHTML = '<form method="' + form.method + '" action="' + form.action + '" name="' + form.name + '" id="message-section" class="basic-element">' + document.querySelector('#message-section').innerHTML + '</form>';
        document.querySelector('#message-section .msg-element').insertAdjacentHTML('afterend', '<div id="usereply-comand">' + content + '</div>');
        document.querySelector('#is-form').remove();
    }
});

/* Quitar clases de los h's */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.is-content .post-content')) {
        [].forEach.call(document.querySelectorAll('.is-content .post-content'), (item) => {
            item.classList.remove('post-content');
        });
    }
});

/* Anclas */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.has-anchor')) {
        [].forEach.call(document.querySelectorAll('.has-anchor'), (item) => {
            item.insertAdjacentHTML('afterbegin', `<a id="anchor-${item.id}" class="page-anchor"></a>`);
        });
    }
});

/* Menciones */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.mentiontag')) {
        [].forEach.call(document.querySelectorAll('.mentiontag'), (item) => {
            item.title = 'Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + item.textContent.slice(1) + '»';
        });
    }
});

/* Eliminar elementos "to-process" */
document.addEventListener('DOMContentLoaded', () => {
    [].forEach.call(document.querySelectorAll('.to-process'), (item) => {
        item.remove();
    });
});

/* Dar formato al contenido de los '#forum-rules' */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#forum-rules')) {
        document.querySelector('#forum-rules').innerHTML = document.querySelector('#forum-rules').innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
});

/* Poner styles en los posts */
document.addEventListener('forumReady', () => {
    if (forumConfig.skinOptions.allowCustomStyles && document.querySelector('#forum-content .forum-custom-styles')) {
        let style = '';

        [].forEach.call(document.querySelectorAll('#forum-content .forum-custom-styles'), (item) => {
            style += item.innerHTML;

            item.remove();
        });

        document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
    }
});

/* Controles del foro */
document.addEventListener('forumReady', () => {
    FNR.behaviour.genControls();
});

/* Seleccionar código */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.codebox')) {
        [].forEach.call(document.querySelectorAll('.codebox'), (item) => {
            item.querySelector('dt span').onclick = () => {
                navigator.clipboard.writeText(item.querySelector('code').innerText);

                FNR.html.genNotification('¡Copiado!', 'Recuerda engancharlo en algún lugar.', 'fas fa-copy');
            };
        });
    }
});

/* Pestañas */
document.addEventListener('forumReady', () => {
    [].forEach.call(document.querySelectorAll('.is-clickbox'), (item) => {
        const category = item.dataset.categorybox;
        const id = item.dataset.categoryid;

        if (item.classList.contains('is-toggle')) {
            item.onclick = () => {
                document.querySelector('.is-clickbox[categorybox="' + category + '"][categoryid="' + id + '"]').classList.toggle('is-active');
                document.querySelector('.is-selectbox[categorybox="' + category + '"][categoryid="' + id + '"]').classList.toggle('is-active');
            };
        } else {
            item.onclick = () => {
                document.querySelector('.is-clickbox.is-active[categorybox="' + category + '"]').classList.remove('is-active');
                document.querySelector('.is-clickbox[categorybox="' + category + '"][categoryid="' + id + '"]').classList.add('is-active');

                document.querySelector('.is-selectbox.is-active[categorybox="' + category + '"]').classList.remove('is-active');
                document.querySelector('.is-selectbox[categorybox="' + category + '"][categoryid="' + id + '"]').classList.add('is-active');
            };
        }
    });
});

/* Menú Wiki */
document.addEventListener('forumReady', () => {
    FNR.behaviour.genWiki();
});

/* Checkbox */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.checkbox-click:not(.is-radio)')) {
        [].forEach.call(document.querySelectorAll('.checkbox-click:not(.is-radio)'), (item) => {
            const checkbox = item.parentElement.parentElement;
            const real = checkbox.querySelector('.checkbox-real input');

            if (real.checked) {
                checkbox.classList.add('is-active');
            }

            item.parentElement.onclick = () => {
                if (!checkbox.classList.contains('is-active')) {
                    checkbox.classList.add('is-active');

                    real.checked = true;
                } else {
                    checkbox.classList.remove('is-active');

                    real.checked = false;
                }
            };
        });
    }
});

/* Radio */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.checkbox-click.is-radio')) {
        [].forEach.call(document.querySelectorAll('.checkbox-click.is-radio'), (item) => {
            const checkbox = item.parentElement.parentElement;
            const real = checkbox.querySelector('.checkbox-real input');

            if (real.checked) {
                checkbox.classList.add('is-active');
            }

            item.parentElement.onclick = () => {
                [].forEach.call(document.querySelectorAll('input[type="radio"][name="' + real.name + '"]'), (item) => {
                    const classList = item.parentElement.parentElement.classList;

                    if (classList.contains('is-active')) {
                        classList.remove('is-active');
                    }
                });

                if (!checkbox.classList.contains('is-active')) {
                    checkbox.classList.add('is-active');

                    real.checked = true;
                } else {
                    checkbox.classList.remove('is-active');

                    real.checked = false;
                }
            };
        });
    }
});

/* Inputs en botones */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.is-input')) {
        [].forEach.call(document.querySelectorAll('.is-input'), (item) => {
            item.onclick = (e) => {
                item.querySelector('input[type="submit"]').click();
            };
        });
    }
});

/* Desplegables */
document.addEventListener('forumReady', () => {
    FNR.behaviour.genDropeable();
});

/* Ajustar tamaños */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.is-tweakeable')) {
        document.fonts.ready.then(() => {
            FNR.behaviour.genMeassure();
        });
    }
});

/* Enlaces de subforos */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.forum-element .forum-links a')) {
        document.querySelectorAll('.forum-element .forum-links a').forEach(link => link.title = 'Ir al tema «' + link.textContent + '»');
    }
});

/* Ordenar listas */
document.addEventListener('forumReady', () => {
    if (document.querySelector('.is-ordered')) {
        document.querySelectorAll('.is-ordered').forEach(list => {
            const orderedList = [];

            list.querySelectorAll(':scope > li').forEach(element => orderedList.push({
                original: element.outerHTML,
                order: element.textContent
            }));

            orderedList.sort((a, b) => {
                if (a.order < b.order) {
                    return -1;
                }

                if (a.order > b.order) {
                    return 1;
                }

                return 0;
            });

            list.innerHTML = orderedList.map(element => element.original).join('');
        });
    }
});

/* Formatear mensajes de dados */
document.addEventListener('DOMContentLoaded', () => {
    const getWhoRolled = (message) => [...message.matchAll(/\'\<strong\>(.*)\<\/strong\>\'/gi)][0][1];

    const getRolls = (message) => message.split('<br><br>--------------------------------<br><br>').map(roll => {
        const isNumeric = roll.indexOf('<img src="') === -1;
        const [rollName, rollResults] = roll.replace(`' :<br> `, `' : `).split(' : ');

        return {
            rollName: getRollName(rollName),
            rollResults: isNumeric ? getRollResultsByNumber(rollResults) : getRollResultsByImage(rollResults)
        }
    });

    const getRollName = (message) => [...message.matchAll(/\'(.*)\'/gi)][0][1];

    const getRollResultsByImage = (message) => [...message.matchAll(/src\s*=\s*"(.+?)"/gi)].map(roll => roll[1]);

    const getRollResultsByNumber = (message) => message.replace(/\<strong\>/gi, '').replace(/\<\/strong\>/gi, '').split(', ').map(Number);

    const renderRoll = ({ rollName, rollResults }) => {
        const rollType = FNR.utility.genSlug(rollName, '-');

        return `
        <li class="rolllist-roll rolllist-${rollType}">
            <h6>${rollName}</h6>
            <ul class="roll-results">
                ${rollResults.map(rollResult => renderResult(rollName, rollType, rollResult)).join('')}
            </ul>
        </li>
        `
    };

    const renderResult = (name, type, result) => `
    <li class="roll-result roll-${type}">
        ${typeof result === 'number' ? result : `<img src="${result}" alt='Resultado de la tirada del dado «${name}»' title='Resultado de la tirada del dado «${name}»' />`}
    </li>
    `;

    [...document.querySelectorAll('.postlist-post .is-content')].filter(message => message.innerHTML.match('ha efectuado la acción siguiente: <strong>Tirada</strong>')).forEach(message => {
        const [userSection, rollSection] = message.innerHTML.split('<hr>');

        const whoRolled = getWhoRolled(userSection);
        const rollList = getRolls(rollSection);

        message.closest('.postlist-post').classList.add('post-diceroll');
        message.classList.add('content-dice');
        message.innerHTML = `
            <blockquote>
                <div>¡<strong>${whoRolled}</strong> ha realizado <em>${rollList.length === 1 ? 'una tirada' : 'varias tiradas'}</em>!</div>
            </blockquote>
            <ul class="dice-rolllist">
                ${rollList.map(renderRoll).join('')}
            </ul>
        `;
    });
});

/* Ejecutar evento y mostrar foro */
document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
        document.dispatchEvent(forumReady);
        document.querySelector('#forum-body > .main-body').classList.remove('is-invisible');
    });
});