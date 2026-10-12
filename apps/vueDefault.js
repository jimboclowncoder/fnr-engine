Vue.component('panel-control', {
    props: ['elements'],
    data() {
        return {
            userId: _userdata.user_id,
            state: {
                page: 0
            },
            content: {
                original: [],
                current: []
            }
        }
    },
    computed: {
        validationPanel() {
            return FNR.utility.genValidation(this.content.current)
        },
        toSave() {
            let final = [];

            [].forEach.call(this.content.current, (item, index) => {
                if (item.value !== this.content.original[index].value) {
                    final.push({
                        name: item.name,
                        type: item.type,
                        value: item.value
                    });
                }
            });

            return final;
        }
    },
    methods: {
        updateProfile() {
            if (!this.toSave.length || this.validationPanel !== '') {
                return;
            }

            this.state.page = 2;

            FNR.user.profile.setData(this.toSave).then((r) => {
                if (r) {
                    let status = false;

                    this.toSave.map((item) => {
                        if (item.name.toLowerCase().indexOf('tema') > -1) status = true;
                    });

                    if (status) {
                        FNR.html.genNotification('Atención', 'Información actualizada sin inconvenientes.', 'fas fa-check');

                        FNR.user.setTheme(true);
                    } else {
                        FNR.html.genNotification('Atención', 'Información actualizada sin inconvenientes.', 'fas fa-check');

                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                } else {
                    FNR.html.genNotification('Atención', 'Hubo un problema al actualizar. Dale otro intento.', 'fas fa-exclamation');
                }
            });
        }
    },
    created() {
        FNR.user.profile.getData(JSON.parse(this.elements.replace(/'/g, '"'))).then((r) => {
            this.content.original = JSON.parse(JSON.stringify(r));
            this.content.current = r;
            this.state.page = 1;
        });
    },
    template: `
    <section id="forum-cp" class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Editar perfil</h2>
            <hr />
            <p>En esta página podrás editar tu perfil de usuario. En caso de que quieras editar tu contraseña, por favor dirígete a <a title="Ir a «Cambiar contraseña»" :href="'/profile?change_password=Cambiar+tu+contraseña&mode=editprofile&page_profil=informations&user_id=' + userId">este enlace</a>.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <section class="forum-wikilist">
                <aviso-foro v-show="validationPanel !== ''">
                    <ul v-html="validationPanel"></ul>
                </aviso-foro>
                <ul class="forum-fieldlist no-style">
                    <li v-for="item in content.current">
                        <campo-foro :name="item.name">
                            <input v-model="item.value" v-if="item.type === 'input' || item.type === 'avatar'" type="text"/>
                            <textarea v-model="item.value" v-else-if="item.type === 'textarea'"></textarea>
                            <div v-else-if="item.type === 'select'" class="select-container">
                                <select v-model="item.value">
                                    <option :value="option.value" v-for="option in item.options">{{ option.name }}</option>
                                </select>
                            </div>
                        </campo-foro>
                    </li>
                </ul>
                <div id="usereply-comand">
                    <button class="button1 btn-main" @click="updateProfile()" title="Actualizar perfil">Actualizar</button>
                </div>
            </section>
        </template>
        <template v-if="state.page === 2">
            <cargando-foro text="Actualizando información…"></cargando-foro>
        </template>
    </section>
    `
});

Vue.component('lista-bosquejos', {
    data() {
        return {
            state: {
                page: 0,
            },
            drafts: {
                messages: {
                    page: 1,
                    loading: 0,
                    pages: [],
                    content: []
                },
                topics: {
                    page: 1,
                    loading: 0,
                    pages: [],
                    content: []
                }
            }
        }
    },
    methods: {
        getPageMessages(id) {
            this.drafts.messages.loading = 0;

            FNR.user.drafts.messages.getDrafts(id).then((r) => {
                this.drafts.messages.content = r;
                this.drafts.messages.loading = 1;
                this.state.page = 1;
            });
        },
        getPageTopics(id) {
            this.drafts.topics.loading = 0;

            FNR.user.drafts.topics.getDrafts(id).then((r) => {
                this.drafts.topics.content = r;
                this.drafts.topics.loading = 1;
                this.state.page = 1;
            });
        },
        setPageMessages(id) {
            this.drafts.messages.page = id;
            this.getPageMessages(this.drafts.messages.pages[this.drafts.messages.page - 1]);
        },
        setPageTopics(id) {
            this.drafts.topics.page = id;
            this.getPageMessages(this.drafts.topics.pages[this.drafts.topics.page - 1]);
        },
    },
    created() {
        Promise.all([FNR.user.drafts.messages.getPages(), FNR.user.drafts.topics.getPages()]).then((r) => {
            if (r[0].items !== 0) {
                this.drafts.messages.pages = r[0].pages;
                this.getPageMessages(this.drafts.messages.pages[this.drafts.messages.page - 1]);
            }

            if (r[1].items !== 0) {
                this.drafts.topics.pages = r[1].pages;
                this.getPageTopics(this.drafts.topics.pages[this.drafts.topics.page - 1]);
            }

            if (r[0].items + r[1].items === 0) {
                this.state.page = 1;
            }
        });
    },
    updated() {
        FNR.behaviour.genControls();
    },
    template: `
    <section class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Lista de Bosquejos</h2>
            <hr />
            <p>En esta página tienes tu lista de Bosquejos dividida entre mensajes y temas.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <mando-foro id="upper-controls" app="true">
                <template slot="pagination" v-if="drafts.messages.pages.length > 1">
                    <paginacion-foro :page="drafts.messages.page" :total="drafts.messages.pages.length" @setPage="setPageMessages" />
                </template>
            </mando-foro>
            <section id="forum-drafts-messages" class="forum-topiclist">
                <lista-temas-cabecera elements="['Mensajes', 'Información']"></lista-temas-cabecera>
                <ul :class="'topiclist-topics no-style' + (!drafts.messages.content.length || drafts.messages.loading === 0 ? ' no-results': '')">
                    <template v-if="!drafts.messages.content.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No tienes bosquejos</h6>
                        </li>
                    </template>
                    <template v-else-if="drafts.messages.loading === 0">
                        <li class="is-not-topic is-not-lastpost">
                            <cargando-foro text="Cargando temas…"></cargando-foro>
                        </li>
                    </template>
                    <template v-else>
                        <li class="row is-not-topic is-not-lastpost" v-for="draft in drafts.messages.content">
                            <temas-foro type="draft" mode="" :url="draft.topic.url" :replies="draft.info.location" :views="draft.info.date" :quick="draft.modify">
                                <template slot="title">{{ draft.topic.name }}</template>
                            </temas-foro>
                        </li>
                    </template>
                </ul>
            </section>
            <mando-foro id="lower-controls" app="true">
                <template slot="pagination" v-if="drafts.messages.pages.length > 1">
                    <paginacion-foro :page="drafts.messages.page" :total="drafts.messages.pages.length" @setPage="setPageMessages" />
                </template>
            </mando-foro>
  	        <separador-foro></separador-foro>
            <mando-foro id="upper-controls" app="true">
                <template slot="pagination" v-if="drafts.topics.pages.length > 1">
                    <paginacion-foro :page="drafts.topics.page" :total="drafts.topics.pages.length" @setPage="setPageTopics" />
                </template>
            </mando-foro>
            <section id="forum-drafts-messages" class="forum-topiclist">
                <lista-temas-cabecera elements="['Temas', 'Información']"></lista-temas-cabecera>
                <ul :class="'topiclist-topics no-style' + (!drafts.topics.content.length || drafts.topics.loading === 0 ? ' no-results': '')">
                    <template v-if="!drafts.topics.content.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No tienes bosquejos</h6>
                        </li>
                    </template>
                    <template v-else-if="drafts.topics.loading === 0">
                        <li class="is-not-topic is-not-lastpost">
                            <cargando-foro text="Cargando temas…"></cargando-foro>
                        </li>
                    </template>
                    <template v-else>
                        <li class="row is-not-topic is-not-lastpost" v-for="draft in drafts.topics.content">
                            <temas-foro type="draft" mode="" :url="draft.topic.url" :replies="draft.info.location" :views="draft.info.date" :quick="draft.modify">
                                <template slot="title">{{ draft.topic.name }}</template>
                            </temas-foro>
                        </li>
                    </template>
                </ul>
            </section>
            <mando-foro id="lower-controls" app="true">
                <template slot="pagination" v-if="drafts.topics.pages.length > 1">
                    <paginacion-foro :page="drafts.topics.page" :total="drafts.topics.pages.length" @setPage="setPageTopics" />
                </template>
            </mando-foro>
        </template>
    </section>
    `
});

Vue.component('lista-seguidos', {
    data() {
        return {
            state: {
                page: 0,
                selected: [],
            },
            followed: {
                page: 1,
                loading: 0,
                pages: [],
                content: []
            }
        }
    },
    methods: {
        getPage(id) {
            this.followed.loading = 0;

            FNR.user.followed.getFollowed(id).then((r) => {
                this.followed.content = r;
                this.followed.loading = 1;
                this.state.page = 1;
            });
        },
        setPage(id) {
            this.followed.page = id;
            this.getPage(this.followed.pages[this.followed.page - 1]);
        },
        setTopic(id) {
            const positionId = this.state.selected.indexOf(id);

            if (positionId === -1) {
                this.state.selected.push(id);
            } else {
                this.state.selected.splice(positionId, 1);
            }
        },
        delTopics() {
            if (!this.state.selected.length) {
                return;
            }

            FNR.html.genPrompt('Necesitamos confirmación', 'Te dispones a retirar la supervisión de uno (o varios) temas. ¿Estás segur@?', 'Escribe «ELIMINAR» para confirmar', '').then(r => {
                if (r === 'ELIMINAR') {
                    FNR.user.followed.delFollowed(this.state.selected).then((r) => {
                        if (r) {
                            window.location.reload();
                        } else {
                            FNR.html.genNotification('Atención', 'Hubo un problema al retirar. Inténtalo de nuevo.', 'fas fa-exclamation');
                        }
                    });
                }
            });
        }
    },
    created() {
        FNR.user.followed.getPages().then((r) => {
            if (r.items === 0) {
                this.state.page = 1;
                return;
            }

            this.followed.pages = r.pages;
            this.getPage(this.followed.pages[this.followed.page - 1]);
        });
    },
    updated() {
        FNR.behaviour.genControls();
    },
    template: `
    <section class="wiki-content is-dramatic">
        <div class="is-content">
            <h2>Lista de Temas Supervisados</h2>
            <hr />
            <p>En esta página tienes tu lista de Temas Supervisados.</p>
            <p>Ante cualquier duda o problema, contacta con la administración.</p>
        </div>
        <separador-foro />
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <mando-foro id="upper-controls" app="true">
                <template slot="pagination" v-if="followed.pages.length > 1">
                    <paginacion-foro :page="followed.page" :total="followed.pages.length" @setPage="setPage" />
                </template>
                <template slot="controls">
                    <li v-if="followed.content.length" @click="delTopics()">
                        <boton-foro url="javascript:{}" name="Retirar" icon="fas fa-minus"></boton-foro>
                    </li>
                </template>
            </mando-foro>
            <section id="forum-followed" class="forum-topiclist">
                <lista-temas-cabecera elements="['Temas', 'Información']"></lista-temas-cabecera>
                <ul :class="'topiclist-topics no-style' + (!followed.content.length || followed.loading === 0 ? ' no-results': '')">
                    <template v-if="!followed.content.length">
                        <li class="is-not-topic is-not-lastpost">
                            <h6>No tienes temas supervisados</h6>
                        </li>
                    </template>
                    <template v-else-if="followed.loading === 0">
                        <li class="is-not-topic is-not-lastpost">
                            <cargando-foro text="Cargando temas…"></cargando-foro>
                        </li>
                    </template>
                    <template v-else>
                        <li :class="'row is-not-topic is-not-lastpost ' + topic.type" v-for="topic in followed.content" :key="topic.id">
                            <temas-foro type="followed" mode="" :url="topic.url" :replies="topic.replies + ' respuestas'" :views="topic.views + ' visitas'">
                                <template slot="title">{{ topic.name }}</template>
                                <template slot="radio">
                                    <div :class="'forum-checkbox' + (state.selected.indexOf(topic.id) === -1 ? '' : ' is-active')">
                                        <div class="checkbox-content" @click="setTopic(topic.id)">
                                            <div class="checkbox-click">
                                                <i class="fas fa-check"></i>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </temas-foro>
                        </li>
                    </template>
                </ul>
            </section>
            <mando-foro id="lower-controls" app="true">
                <template slot="pagination" v-if="followed.pages.length > 1">
                    <paginacion-foro :page="followed.page" :total="followed.pages.length" @setPage="setPage" />
                </template>
                <template slot="controls">
                    <li v-if="followed.content.length" @click="delTopics()">
                        <boton-foro url="javascript:{}" name="Retirar" icon="fas fa-minus"></boton-foro>
                    </li>
                </template>
            </mando-foro>
        </template>
    </section>
    `
});

Vue.component('editor-foro', {
    data() {
        return {
            state: {
                page: 0,
                editor: 'none',
                admin: (_userdata.user_level === 1),
                guest: (_userdata.session_logged_in === 0),
                dice: document.querySelectorAll('#list_dice').length,
                draft: document.querySelectorAll('input[name="draft"]').length,
                edit: document.querySelectorAll('input[name="edit_reason"]').length,
            },
            colors: FNR.forum.getColors(),
            content: {
                username: '',
                subject: '',
                edit: -1,
                msg: '',
                type: -1,
                options: []
            },
            users: {
                current: '',
                options: [],
                selected: [],
                selector: true
            },
            groups: {
                type: -1,
                options: []
            },
            dice: {
                options: [],
                current: []
            }
        }
    },
    computed: {
        msgCheck() {
            let final = '';

            if (this.state.guest) {
                if (this.content.username.trim().length < 1 || this.content.username.trim().length > 60) {
                    final += '<li>Escribe un nombre de usuario de tamaño adecuado.</li>';
                }
            }

            if (this.state.editor === 'post') {
                if (this.users.selected.length === 0 && this.groups.type === -1) {
                    final += '<li>Selecciona al menos un usuario.</li>';
                }
            }

            if (this.state.admin) {
                if (this.state.editor === 'post') {
                    if (this.users.selected.length === 0 && this.groups.type === -1) {
                        final += '<li>Selecciona un grupo.</li>';
                    }
                }
            }

            if (this.state.editor === 'newtopic' || this.state.editor === 'post' || this.state.editor === 'edittopicdraft') {
                if (this.content.subject.trim().length < 4 || this.content.subject.trim().length > 100) {
                    final += '<li>Escribe un titulo de tamaño adecuado (4 a 100 carácteres).</li>';
                }
            }

            if (this.content.msg.trim().length < 10) {
                final += '<li>Escribe un mensaje lo suficientemente largo.</li>';
            }

            return final;
        },
        sortedCharacters() {
            if (!Object.keys(this.users.options).length) return [];
            else return this.users.options.map((item) => {
                return item.user;
            }).filter((item) => {
                return this.users.selected.indexOf(item) === -1;
            }).filter((item) => {
                return item.toLowerCase().indexOf(this.users.current.toLowerCase()) > -1;
            }).sort((a, b) => {
                if (a < b) return -1;
                else if (a > b) return 1;
                return 0;
            });
        },
        sortedEditCharacters() {
            return this.users.selected.sort((a, b) => {
                if (a < b) return -1;
                else if (a > b) return 1;
                return 0;
            });
        }
    },
    methods: {
        insertSomething(insertBefore, insertAfter) {
            const myField = document.querySelector('#usereply-editor');
            const pre = insertBefore.replace(/-jump-/g, '\n');
            const post = insertAfter.replace(/-jump-/g, '\n');

            if (document.selection) {
                myField.focus();
                document.selection.createRange().text = pre + document.selection.createRange().text + post;
            } else if (myField.selectionStart || myField.selectionStart == '0') {
                const startPos = myField.selectionStart;
                const endPos = myField.selectionEnd
                const cursorPos = endPos + pre.length;

                myField.value = myField.value.substring(0, startPos) + pre + myField.value.substring(startPos, endPos) + post + myField.value.substring(endPos, myField.value.length);
                myField.setSelectionRange(cursorPos, cursorPos);
            }

            this.content.msg = myField.value;
        },
        newDice() {
            this.dice.current.push({
                dice: -1,
                number: 0
            });
        },
        addCharacter(character) {
            this.users.selected.push(character);
            this.users.selector = false;
            this.users.current = '';

            setTimeout(() => {
                this.users.selector = true;
            }, 250);
        },
        deleteCharacter(index) {
            this.users.current = '';
            this.users.selected.splice(index, 1);
        },
        changeGroup() {
            this.users.selected = [];
            this.users.current = '';
        },
        insertUrl() {
            const myField = document.querySelector('#usereply-editor');
            const startPos = myField.selectionStart;
            const endPos = myField.selectionEnd;

            FNR.html.genPrompt('Insertar enlace', 'Introduce el título del enlace. Por defecto, ponemos la este como título.', 'Título del enlace', '').then((result) => {
                if (result !== false) {
                    this.insertSomething('[url=', ']' + result + '[/url]');
                } else {
                    this.insertSomething('[url=', ']' + myField.value.substring(startPos, endPos) + '[/url]');
                }
            });
        },
        insertImg() {
            FNR.html.genPrompt('Insertar imagen', 'Introduce las medidas de la imagen en píxeles pero sin la medida (por ejemplo 100x100). <u>En caso de dejarlo en blanco, se insertará con la medida inicial</u>.', 'Medidas de la imagen', '').then((result) => {
                if (result !== false && result.indexOf('x') > -1) {
                    const [width, ...heigth] = result.split('x');

                    this.insertSomething(`[img(${width}px,${heigth}px)]`, '[/img]');
                } else {
                    this.insertSomething('[img]', '[/img]');
                }
            });
        },
        insertSpoiler() {
            FNR.html.genPrompt('Insertar spoiler', 'Introduce el título del spoiler. <u>En caso de dejarlo en blanco, se insertará sin él</u>.', 'Título del spoiler', '').then((result) => {
                if (result !== false) {
                    this.insertSomething('[spoiler="' + result + '"]', '[/spoiler]');
                } else {
                    this.insertSomething('[spoiler]', '[/spoiler]');
                }
            });
        },
        insertQuote() {
            FNR.html.genPrompt('Insertar cita', 'Introduce el destinatario de la cita. <u>En caso de dejarlo en blanco, se insertará sin él</u>.', 'Destinatario de la cita', '').then((result) => {
                if (result !== false) {
                    this.insertSomething('[quote="' + result + '"]', '[/quote]');
                } else {
                    this.insertSomething('[quote]', '[/quote]');
                }
            });
        },
        parseMsg() {
            window.forumParsing = true;

            if (document.querySelector('#forum-realreply > form .sceditor-container > textarea')) {
                document.querySelector('#forum-realreply > form .sceditor-container > textarea').value = this.content.msg.replace(/#per/g, this.colors[this.colors.length - 1].hex);
            } else {
                document.querySelector('#forum-realreply > form textarea#text_editor_textarea').value = this.content.msg.replace(/#per/g, this.colors[this.colors.length - 1].hex);
            }

            if (this.state.guest) {
                if (this.content.subject.trim().length > 4 || this.content.subject.trim().length < 60) {
                    document.querySelector('#forum-realreply > form input[name="username"]').value = this.content.username;
                }
            }

            if (this.state.editor === 'post') {
                if (this.users.selected.length > 0 && this.groups.type === -1) {
                    this.users.selected.forEach((item) => {
                        document.querySelector('#forum-realreply > form #add_username').click()
                        document.querySelectorAll('#forum-realreply > form input[name="username[]"]')[document.querySelectorAll('#forum-realreply > form input[name="username[]"]').length - 2].value = item;
                    });
                }
            }

            if (this.state.editor === 'reply') {
                if (FNR.content.isAutosave()) {
                    if (FNR.cache.getData('post' + document.post.t.value + '-' + _userdata.user_id) !== false && _userdata.user_id !== -1) {
                        FNR.cache.delData('post' + document.post.t.value + '-' + _userdata.user_id);
                    }
                }

                if (this.state.edit) {
                    document.querySelector('#forum-realreply > form input[name="edit_reason"]').value = 'editar';
                }
            }

            if (this.state.admin) {
                if (this.state.editor === 'post') {
                    if (this.users.selected.length === 0 && this.groups.type !== -1) {
                        document.querySelector('#forum-realreply > form select[name="usergroup"]').value = this.groups.type;
                    }
                } else if (this.state.editor === 'newtopic' && this.content.type !== -1) {
                    document.querySelector('#forum-realreply > form input[type="radio"][name="topictype"][value="' + this.content.type + '"]').checked = true;
                }

                if (this.state.edit) {
                    if (parseInt(this.content.edit) === 0) {
                        document.querySelector('#forum-realreply > form input[name="edit_reason"]').value = 'not-show';
                    }
                }
            }

            if (this.state.editor === 'newtopic' || this.state.editor === 'post' || this.state.editor === 'edittopicdraft') {
                if (this.content.subject.trim().length > 4 || this.content.subject.trim().length < 100) {
                    document.querySelector('#forum-realreply > form input[name="subject"]').value = this.content.subject.trim();
                }
            }

            if (this.state.dice && (this.state.editor === 'reply' || this.state.editor === 'newtopic' || this.state.editor === 'editpostdraft' || this.state.editor === 'edittopicdraft')) {
                [].forEach.call(document.querySelectorAll('#forum-realreply > form #list_dice tr'), (item, index) => {
                    if (index !== 0) {
                        item.remove();
                    }
                });

                document.querySelector('#forum-realreply > form #list_dice tr td').insertAdjacentHTML('beforeend', '<span id="dice_to_del"></span>');

                this.dice.current.filter((item) => {
                    return item.dice !== -1;
                }).filter((item) => {
                    return parseFloat(item.number) !== 0 && !isNaN(parseFloat(item.number));
                }).forEach((item) => {
                    add_dice(document.querySelectorAll('#list_dice tr').length, item.dice, item.number);
                });
            }
        },
        draftMsg() {
            if (this.msgCheck.length) {
                return;
            }

            this.parseMsg();

            document.querySelector('#forum-realreply > form input[value="Bosquejo"], #forum-realreply input[value="Modificar"], #forum-realreply input[value="Registrar"]').click();
        },
        delMsg() {
            let type = 'topicdraft';
            let param = 't';

            if (this.state.editor === 'editpostdraft') {
                type = 'draft';
                param = 'p';
            }

            FNR.html.genPrompt('Necesitamos confirmación', 'Te dispones a eliminar un bosquejo. ¿Estás segur@?', 'Escribe «ELIMINAR» para confirmar', '').then(r => {
                if (r === 'ELIMINAR') {
                    FNR.user.drafts.delDrafts(type, [document.post[param].value]).then((r) => {
                        if (r) {
                            window.location.replace(`${window.location.protocol}//${window.location.host}${forumConfig.usableDirections.ucp}#/bosquejos`)
                        } else {
                            FNR.html.genNotification('Atención', 'Hubo un problema al eliminar. Inténtalo de nuevo.', 'fas fa-exclamation');
                        }
                    });
                }
            });
        },
        sendMsg() {
            if (this.msgCheck.length) {
                return;
            }

            this.parseMsg();

            document.querySelector('#forum-realreply > form input[value="Enviar"], #forum-realreply input[value="Publicar"]').click();
        },
        prevMsg() {
            if (this.msgCheck.length) {
                return;
            }

            this.parseMsg();

            document.querySelector('#forum-realreply > form input[value="Previsualización"], #forum-realreply input[value="Previsualizar"]').click();
        }
    },
    created() {
        const prepareEditor = () => {
            if (document.querySelector('#forum-realreply > form input[name="username"]')) {
                this.content.username = document.querySelector('#forum-realreply > form input[name="username"]').value;
            }

            if (document.querySelector('#forum-realreply > form #text_editor_textarea')) {
                let content = document.querySelector('#forum-realreply > form #text_editor_textarea').value;

                this.content.msg = content;
            }

            if (document.querySelector('#forum-realreply > form input[name="subject"]')) {
                let subject = document.querySelector('#forum-realreply input[name="subject"]').value;

                if (document.querySelector('#forum-realreply select[name="usergroup"]') && document.querySelector('#forum-realreply select[name="usergroup"]').value !== '') {
                    this.groups.type = document.querySelector('#forum-realreply select[name="usergroup"]').value;
                } else if (document.querySelector('#forum-realreply input[name="username[]"]')) {
                    [].forEach.call(document.querySelectorAll('#forum-realreply input[name="username[]"]'), (item) => {
                        if (item.value !== '') {
                            this.users.selected.push(item.value);
                        }
                    });
                }

                this.content.subject = subject;
            }

            if (document.querySelector('#forum-realreply > form input[name="edit_reason"]')) {
                const status = document.querySelector('#forum-realreply > form input[name="edit_reason"]').value;

                if (status === 'editar') {
                    this.content.edit = 1;
                } else if (status === 'not-show') {
                    this.content.edit = 0;
                }
            }

            if (document.querySelector('#forum-realreply > form #list_dice')) {
                [].forEach.call(document.querySelectorAll('#forum-realreply > form #list_dice #post_dice option'), (item) => {
                    if (item.value !== '') {
                        this.dice.options.push({
                            value: item.value,
                            content: item.textContent
                        });
                    }
                });

                if (document.querySelectorAll('#forum-realreply > form #list_dice tr').length === 1) {
                    this.dice.current.push({
                        dice: -1,
                        number: 0
                    });
                } else {
                    [].forEach.call(document.querySelectorAll('#forum-realreply > form #list_dice tr'), (item) => {
                        if (item.querySelector('select').value !== '') {
                            this.dice.current.push({
                                dice: parseFloat(item.querySelector('select').value),
                                number: parseFloat(item.querySelector('input').value)
                            });
                        }
                    });
                }
            }

            if (document.querySelectorAll('#forum-realreply > form .panel.row3 input[type="radio"]').length === 4) {
                [].forEach.call(document.querySelectorAll('#forum-realreply > form .panel.row3 input[type="radio"]'), (item) => {
                    this.content.options.push({
                        value: item.value,
                        name: item.parentElement.textContent.trim()
                    });

                    if (item.checked) {
                        this.content.type = item.value;
                    }
                });
            }

            if (document.querySelector('#forum-realreply > form select[name="usergroup"]')) {
                [].forEach.call(document.querySelectorAll('#forum-realreply > form select[name="usergroup"] option'), (item) => {
                    if (item.value !== '') {
                        this.groups.options.push({
                            value: item.value,
                            name: item.textContent
                        });
                    }
                });
            }

            if (FNR.content.isAutosave()) {
                if (this.content.msg === '' && FNR.cache.getData('post' + document.post.t.value + '-' + _userdata.user_id) !== false && _userdata.user_id !== -1) {
                    this.content.msg = FNR.cache.getData('post' + document.post.t.value + '-' + _userdata.user_id);
                }
            }

            this.state.page = 1;

            document.onkeydown = (e) => {
                const editor = document.querySelector('#usereply-editor');

                if (document.activeElement === editor) {
                    if (e.ctrlKey && e.key === 'b') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b]', '[/b]');
                    } else if (e.ctrlKey && e.key === 'i') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[i]', '[/i]');
                    } else if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[strike]', '[/strike]');
                    } else if (e.ctrlKey && e.key === 'u') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[u]', '[/u]');
                    } else if (e.ctrlKey && e.key === ',') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[left]', '[/left]');
                    } else if (e.ctrlKey && e.key === '.') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[center]', '[/center]');
                    } else if (e.ctrlKey && e.key === '-') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[right]', '[/right]');
                    } else if (e.ctrlKey && e.key === 'o') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertUrl();
                    } else if (e.ctrlKey && e.key === 'p') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertImg();
                    } else if (e.ctrlKey && e.key === '`') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSpoiler();
                    } else if (e.ctrlKey && e.key === '+') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[code]', '[/code]');
                    } else if (e.ctrlKey && e.key === 'l') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertQuote();
                    } else if (e.ctrlKey && e.key === 'ñ') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[hide]', '[/hide]');
                    } else if (e.ctrlKey && e.key === '´') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[youtube]', '[/youtube]');
                    } else if (e.ctrlKey && e.key === '1' && this.colors[0] !== 'undefined' && (this.colors.length - 1) !== 0) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[0].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '!' && this.colors[0] !== 'undefined' && (this.colors.length - 1) !== 0) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[0].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '2' && this.colors[1] !== 'undefined' && (this.colors.length - 1) !== 1) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[1].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '"' && this.colors[1] !== 'undefined' && (this.colors.length - 1) !== 1) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[1].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '3' && this.colors[2] !== 'undefined' && (this.colors.length - 1) !== 2) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[2].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '·' && this.colors[2] !== 'undefined' && (this.colors.length - 1) !== 2) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[2].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '4' && this.colors[3] !== 'undefined' && (this.colors.length - 1) !== 3) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[3].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '$' && this.colors[3] !== 'undefined' && (this.colors.length - 1) !== 3) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[3].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '5' && this.colors[4] !== 'undefined' && (this.colors.length - 1) !== 4) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[4].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '%' && this.colors[4] !== 'undefined' && (this.colors.length - 1) !== 4) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[4].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '6' && this.colors[5] !== 'undefined' && (this.colors.length - 1) !== 5) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[5].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '&' && this.colors[5] !== 'undefined' && (this.colors.length - 1) !== 5) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[5].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '7' && this.colors[6] !== 'undefined' && (this.colors.length - 1) !== 6) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[6].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '/' && this.colors[6] !== 'undefined' && (this.colors.length - 1) !== 6) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[6].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '8' && this.colors[7] !== 'undefined' && (this.colors.length - 1) !== 7) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[7].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === '(' && this.colors[7] !== 'undefined' && (this.colors.length - 1) !== 7) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[7].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === '9' && this.colors[8] !== 'undefined' && (this.colors.length - 1) !== 8) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=' + this.colors[8].hex + ']', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === ')' && this.colors[8] !== 'undefined' && (this.colors.length - 1) !== 8) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=' + this.colors[8].hex + ']', '[/color][/b]');
                    } else if (e.ctrlKey && e.key === 'º' && typeof forumConfig.skinOptions.customColour !== 'undefined') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[color=#per]', '[/color]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === 'ª' && typeof forumConfig.skinOptions.customColour !== 'undefined') {
                        e.preventDefault();
                        e.stopPropagation();

                        this.insertSomething('[b][color=#per]', '[/color][/b]');
                    } else if (e.ctrlKey && e.shiftKey && e.key === 'Enter' && !this.msgCheck.length) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.prevMsg();
                    } else if (e.ctrlKey && e.altKey && e.key === 'Enter' && (this.state.editor === 'reply' || this.state.editor === 'newtopic') && this.state.draft && !this.msgCheck.length) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.draftMsg();
                    } else if (e.ctrlKey && e.key === 'Enter' && !this.msgCheck.length) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.sendMsg();
                    } else if (e.ctrlKey && e.key === 'Backspace' && (this.state.editor === 'editpostdraft' || this.state.editor === 'edittopicdraft')) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.delMsg();
                    }
                }
            };

            setTimeout(() => {
                FNR.behaviour.genDropeable();
            }, 250);
        };

        const getMembers = () => {
            if (this.state.editor === 'post') {
                FNR.forum.getMembers(true).then((r) => {
                    this.users.options = r;
                    prepareEditor();
                });
            } else {
                prepareEditor();
            }
        };

        if (document.post !== undefined) {
            if (document.post.mode.value === 'editpost') {
                if (document.post.modif_topic_title !== undefined) {
                    this.state.editor = 'newtopic';
                } else {
                    this.state.editor = 'reply';
                }
            } else if (document.post.mode.value === 'edit') {
                this.state.editor = 'post';
            } else {
                this.state.editor = document.post.mode.value;
            }
        }

        if (!this.state.guest) {
            if (typeof forumConfig.skinOptions.customColour === 'undefined') {
                getMembers();
            } else {
                FNR.user.profile.getData([{
                    name: forumConfig.skinOptions.customColour,
                    type: 'input'
                }]).then((r) => {
                    this.colors.push({
                        hex: r[0].value,
                        name: 'Personal'
                    });

                    getMembers();
                });
            }
        } else {
            setTimeout(() => {
                prepareEditor();
            }, 2000);
        }

        this.state.replies = document.querySelectorAll('.forum-otherposts > *').length || document.querySelector('input[type="submit"][value="Modificar"]') ? 'Varios' : '';
    },
    mounted() {
        insertIntoEditor = (text) => {
            try {
                this.insertSomething(' ' + text + ' ', '')
            } catch (e) {
                if (console) {
                    console.error(e)
                }
            }
        };

        let forumWarning = '';

        if (document.querySelector('p[style="color: red;"]')) {
            forumWarning = document.querySelector('p[style="color: red;"]').textContent;
            console.log(forumWarning);

            if (document.querySelector('p[style="color: red;"]').parentElement.parentElement.id === 'preview') {
                document.querySelector('p[style="color: red;"]').parentElement.parentElement.remove();
            } else {
                document.querySelector('p[style="color: red;"]').remove();
            }
        }

        window.forumParsing = false;

        if (forumWarning !== '') {
            FNR.html.genNotification('Atención', 'Hubo un problema al enviar. Inténtalo de nuevo.', 'fas fa-exclamation');
        }

        if (FNR.content.isAutosave()) {
            window.addEventListener('beforeunload', () => {
                if (forumParsing === false && (document.querySelector('#usereply-editor').value === '' && FNR.cache.getData('post' + document.post.t.value + '-' + _userdata.user_id) !== false || document.querySelector('#usereply-editor').value !== '')) {
                    FNR.cache.setData('post' + document.post.t.value + '-' + _userdata.user_id, document.querySelector('#usereply-editor').value, -1);
                }
            }, false);
        }
    },
    template: `
    <div id="forum-usereply">
        <template v-if="state.page === 0">
            <cargando-foro text="Cargando utilidad…"></cargando-foro>
        </template>
        <template v-else-if="state.page === 1">
            <aviso-foro v-show="msgCheck.length">
                <ul v-html="msgCheck"></ul>
            </aviso-foro>
            <ul id="usereply-extra" class="forum-fieldlist no-style" v-if="state.editor !== 'reply' && state.editor !== 'editpostdraft' || (state.editor === 'reply' && state.admin)">
                <template v-if="state.guest">
                    <li>
                        <campo-foro name="Nombre de usuario">
                            <input type="text" v-model="content.username" placeholder="Escribe tu nombre de usuario." />
                        </campo-foro>
                    </li>
                </template>
                <template v-if="state.editor === 'post'">
                    <li>
                        <campo-foro name="Usuarios">
                            <div class="character-selector">
                                <input type="text" v-model="users.current" placeholder="Escribe el nombre de un usuario." :disabled="groups.type !== -1" />
                                <ul class="no-style selector-list" v-if="users.selector && sortedCharacters.length > 0">
                                    <li v-for="(character, index) in sortedCharacters" @click="addCharacter(character)" :title="'Seleccionar ' + character">{{ character }}<i class="fas fa-plus"></i></li>
                                </ul>
                            </div>
                            <ul v-if="sortedEditCharacters.length" class="no-style character-list">
                                <li v-for="(character, index) in sortedEditCharacters" @click="deleteCharacter(index)" :title="'Quitar ' + character"><i class="fas fa-times"></i> {{ character }}</li>
                            </ul>
                        </campo-foro>
                    </li>
                </template>
                <template v-if="state.admin">
                    <template v-if="state.editor === 'post'">
                        <li>
                            <campo-foro name="Grupo">
                                <div class="select-container">
                                    <select v-model="groups.type" @change="changeGroup()" :disabled="users.selected.length !== 0">
                                        <option value="-1" hidden>Selecciona un grupo.</option>
                                        <option v-for="option in groups.options" :value="option.value">{{ option.name }}</option>
                                    </select>
                                </div>
                            </campo-foro>
                        </li>
                    </template>
                    <template v-else-if="content.type !== -1 && (state.editor === 'newtopic' || state.editor === 'edittopicdraft')">
                        <li>
                            <campo-foro name="Tipo de tema">
                                <div class="select-container">
                                    <select v-model="content.type">
                                        <option value="-1" hidden>Selecciona una opción.</option>
                                        <option v-for="option in content.options" :value="option.value">{{ option.name }}</option>
                                    </select>
                                </div>
                            </campo-foro>
                        </li>
                    </template>
                </template>
                <template v-if="state.editor === 'newtopic' || state.editor === 'post' || state.editor === 'edittopicdraft'">
                    <li>
                        <campo-foro name="Título">
                            <input type="text" v-model="content.subject" placeholder="Escribe el título." />
                        </campo-foro>
                    </li>
                </template>
                <template v-if="state.admin && state.edit">
                    <li>
                        <campo-foro name="Edición">
                            <div class="select-container">
                                <select v-model="content.edit">
                                    <option value="-1" hidden>Selecciona una opción.</option>
                                    <option value="1">Activar</option>
                                    <option value="0">Desactivar</option>
                                </select>
                            </div>
                        </campo-foro>
                    </li>
                </template>
            </ul>
            <div id="usereply-top" class="usereply-header">
                <h3>Editor de texto<small>Ver guía de <a href="https://www.bbcode.org/reference.php" target="_blank">BBCode</a>.</small></h3>
                <div id="usereply-buttons">
                    <ul class="is-hidden-mobile">
                        <li id="bold-button">
                            <button class="usereply-button" @click="insertSomething('[b]', '[/b]')" title="Negrita">
                                <i class="fas fa-bold"></i>
                            </button>
                        </li>
                        <li id="italic-button">
                            <button class="usereply-button" @click="insertSomething('[i]', '[/i]')" title="Cursiva">
                                <i class="fas fa-italic"></i>
                            </button>
                        </li>
                        <li id="underline-button">
                            <button class="usereply-button" @click="insertSomething('[u]', '[/u]')" title="Subrayado">
                                <i class="fas fa-underline"></i>
                            </button>
                        </li>
                        <li id="strike-button">
                            <button class="usereply-button" @click="insertSomething('[strike]', '[/strike]')" title="Tachado">
                                <i class="fas fa-strikethrough"></i>
                            </button>
                        </li>
                    </ul>
                    <ul>
                        <li id="colour-button">
                            <div class="dropdown upper-controls is-dropeable is-right">
                                <div class="dropdown-trigger">
                                    <button class="usereply-button" title="Color">
                                        <i class="fas fa-palette"></i>
                                    </button>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div id="colour-list" class="dropdown-content">
                                        <div v-for="color in colors" class="usereply-option" :style="'color:' + color.hex" @click="insertSomething('[color=' + color.hex + ']', '[/color]')">{{ color.name }}</div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li id="emoji-button">
                            <div class="dropdown upper-controls is-dropeable is-right">
                                <div class="dropdown-trigger">
                                    <button class="usereply-button" title="Emoticono">
                                        <i class="fas fa-smile"></i>
                                    </button>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div id="emoji-list" class="dropdown-content">
                                        <iframe id="quickEmojInternal" marginheight="0" marginwidth="0" name="smilies" scrolling="auto" src="/smilies?mode=smilies_frame"></iframe>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li id="align-button">
                            <div class="dropdown upper-controls is-dropeable is-right">
                                <div class="dropdown-trigger">
                                    <button class="usereply-button" title="Alinear">
                                        <i class="fas fa-align-justify"></i>
                                    </button>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div id="align-list" class="dropdown-content">
                                        <div class="usereply-option" @click="insertSomething('[left]', '[/left]')">Izquierda</div>
                                        <div class="usereply-option" @click="insertSomething('[center]', '[/center]')">Centro</div>
                                        <div class="usereply-option" @click="insertSomething('[right]', '[/right]')">Derecha</div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li id="toolbox-button">
                            <div class="dropdown upper-controls is-dropeable is-right">
                                <div class="dropdown-trigger">
                                    <button class="usereply-button" title="Otros">
                                        <i class="fas fa-toolbox"></i>
                                    </button>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div id="toolbox-list" class="dropdown-content">
                                        <div class="usereply-option" @click="insertUrl()">Enlace</div>
                                        <div class="usereply-option" @click="insertImg()">Imagen</div>
                                        <div class="usereply-option" @click="insertSpoiler()">Spoiler</div>
                                        <div class="usereply-option" @click="insertSomething('[code]', '[/code]')">Code</div>
                                        <div class="usereply-option" @click="insertQuote()">Cita</div>
                                        <div class="usereply-option" @click="insertSomething('[hide]', '[/hide]')">Ocultar</div>
                                        <div class="usereply-option" @click="insertSomething('[youtube]', '[/youtube]')">Youtube</div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <textarea id="usereply-editor" v-model="content.msg"></textarea>
            <div id="usereply-comand">
                <button class="button1 btn-main" @click="sendMsg()">Enviar</button>
                <button class="button1" @click="draftMsg()" v-if="state.editor === 'editpostdraft' || state.editor === 'edittopicdraft'">Modificar</button>
                <button class="button1" @click="draftMsg()" v-else-if="state.draft && (state.editor === 'reply' || state.editor === 'newtopic')">Bosquejo</button>
                <button class="button1" @click="prevMsg()">Previsualizar</button>
                <button class="button1" @click="delMsg()" v-if="state.editor === 'editpostdraft' || state.editor === 'edittopicdraft'">Eliminar</button>
            </div>
            <div v-if="!state.guest && state.dice && (state.editor === 'reply' || state.editor === 'newtopic' || state.editor === 'editpostdraft' || state.editor === 'edittopicdraft')" id="usereply-dice">
                <div class="usereply-header">
                    <h3>Tirar dados</h3>
                </div>
                <ul>
                    <li v-for="(item, index) in dice.current">
                        <div class="select-container">
                            <select v-model="item.dice" @change="item.number = 1">
                                <option value="-1" selected hidden>Selec. un dado</option>
                                <option v-for="option in dice.options" :value="option.value">{{ option.content }}</option>
                            </select>
                        </div>
                        <input type="number" v-model="item.number" />
                        <button @click="newDice()" v-if="(index + 1) === dice.current.length" class="dice-more">
                            <i class="fas fa-plus"></i>
                        </button>
                        <div v-else class="dice-more"></div>
                    </li>
                </ul>
            </div>
        </template>
    </div>
    `
});