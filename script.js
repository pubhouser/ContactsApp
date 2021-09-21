class User {
    constructor(data) {
        this.data = {
            id: data.id || 0,
            name: data.name || null,
            email: data.email || null,
            address: data.address || null,
            phone: data.phone || null
        };
    }

    edit(newData) {
        for(let key in newData) if (this.data[key] && newData[key]) this.data[key] = newData[key];

        /*this.data = Object.assign(this.data, newData);*/
    }

    get() {
        return this.data;
    }
}

class Contacts {
    constructor() {
        this.data = [];
    }

    add(data) {
        if (!data.name && !data.email && !data.address && !data.phone) return;

        let id = 0;

        this.data.forEach(user => {
            if (user.data.id > id) id = user.data.id;
        });

        id++;
        data.id = id;

        const user = new User (data);
        this.data.push(user);

    }

    edit(id, newData) {
        if (!id) return;
        if (!newData.name && !newData.email && !newData.address && !newData.phone) return;

        const user = this.data.find(user => {
            return user.data.id == id;
        });

        user.edit(newData);
    }

    remove(id) {
        if (!id) return;

        this.data = this.data.filter(user => {
            return user.data.id != id;
        });
    }

    get() {
        return this.data;
    }

}

class ContactsApp extends Contacts {
    constructor() {
        super();

        if (!this.storage) {
            this.getData()
            .then(data => {
                this.storage = data;

                this.init();
            });

        } else {
            this.init();
        }
    }

    init() {



        let contactsItem = document.createElement('div');
        contactsItem.classList.add('contacts');

        let h3 = document.createElement('h3');
        h3.classList.add('title');
        h3.innerHTML = 'Contacts';

        let formItem = document.createElement('div');
        formItem.classList.add('contacts__form');

        this.nameElem = document.createElement('input');
        this.nameElem.setAttribute('type', 'text');
        this.nameElem.setAttribute('name', 'name');
        this.nameElem.setAttribute('placeholder', 'Name');

        this.addressElem = document.createElement('input');
        this.addressElem.setAttribute('type', 'text');
        this.addressElem.setAttribute('name', 'address');
        this.addressElem.setAttribute('placeholder', 'Address');

        this.emailElem = document.createElement('input');
        this.emailElem.setAttribute('type', 'text');
        this.emailElem.setAttribute('name', 'email');
        this.emailElem.setAttribute('placeholder', 'Email address');

        this.phoneElem = document.createElement('input');
        this.phoneElem.setAttribute('type', 'text');
        this.phoneElem.setAttribute('name', 'phone');
        this.phoneElem.setAttribute('placeholder', 'Phonenumber');

        let buttonElem = document.createElement('button');
        buttonElem.classList.add('btn__form');
        buttonElem.innerHTML = 'Add';
        
        this.listItem = document.createElement('ul');
        this.listItem.classList.add('contacts__list');

        formItem.append(h3, this.nameElem, this.addressElem, this.emailElem, this.phoneElem, buttonElem);
        contactsItem.append(formItem, this.listItem);
        document.body.append(contactsItem);

        formItem.addEventListener('keyup', event => {
            this.onAdd(event);
        });

        /*buttonElem.addEventListener('click', event => {

            console.log('клик работает');

        });*/

               

        const data = this.storage;
        if (data && data.length > 0) {
            this.data = data;
            this.updateList();
        }

    }

    async getData() {
        return await fetch('http://jsonplaceholder.typicode.com/users')
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.map(user => {
                return {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        phone: user.phone
                        
                    }
                };
            });

            return data;
        });
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    setCookie(name, value, options = {}) {
        options = {
        path: '/',
        ...options
        };
        if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
        }
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
        }
        }
        document.cookie = updatedCookie;
    }

    set storage(data) {
        localStorage.setItem('contacts', JSON.stringify(data));
        this.setCookie('contactExp', '1', { 'max-age': 10 });
    }

    get storage() {
        const contantExp = this.getCookie('contantExp');
        if (!contantExp) localStorage.removeItem('contantExp');

        let data = localStorage.getItem('contacts');

        if (data && data.length == 0) return;

        data = JSON.parse(data);

        if (!data || data.length == 0) return;
        
        data = data.map(user => {
            user = new User(user.data);
            return user;
        });

        return data;
    }


    updateList() {
        this.listItem.innerHTML = '';

        const data = this.get();

        data.forEach( user => {
            let li = document.createElement('li');
            li.classList.add('contact');

            let contactName = document.createElement('div');
            contactName.classList.add('contact__name');

            let contactEmail = document.createElement('div');
            contactEmail.classList.add('contact__email');

            let contactAddress = document.createElement('div');
            contactAddress.classList.add('contact__address');

            let contactPhone = document.createElement('div');
            contactPhone.classList.add('contact__phone');

            let removeBtn = document.createElement('button');
            removeBtn.classList.add('contact__remove');
            removeBtn.innerHTML = 'X';

            if (user.data.name) contactName.innerHTML = user.data.name;
            if (user.data.email) contactEmail.innerHTML = user.data.email;
            if (user.data.address) contactAddress.innerHTML = user.data.address;
            if (user.data.phone) contactPhone.innerHTML = user.data.phone;

            li.append(contactName, contactEmail, contactAddress, contactPhone, removeBtn);
            this.listItem.append(li);

            removeBtn.addEventListener('click', event => {
                this.onRemove(event, user.data.id);
            });

            contactName.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactEmail.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactAddress.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactPhone.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactName.addEventListener('keyup', event => {
                this.onSave(event, user.data.id, 'name');
            }); 

            contactEmail.addEventListener('keyup', event => {
                this.onSave(event, user.data.id, 'email');
            });

            contactAddress.addEventListener('keyup', event => {
                this.onSave(event, user.data.id, 'address');
            });

            contactPhone.addEventListener('keyup', event => {
                this.onSave(event, user.data.id, 'phone');
            });
          

            let bcolorchange = document.querySelector('.contact'),
                bColorChange = function() {
                    let r = Math.floor(Math.random() * 256),
                        g = Math.floor(Math.random() * 256),
                        b = Math.floor(Math.random() * 256);

                li.style.borderColor = 'rgb(' + r + ', ' + g + ', ' + b + ')'

            };

            bColorChange();

        });
        
        this.storage = data;


    }

    onAdd(event) {
        if (event.code != 'Enter') return;
       
        let nameElem = this.nameElem.value;
        let emailElem = this.emailElem.value;
        let addressElem = this.addressElem.value;
        let phoneElem = this.phoneElem.value;

        const data = {
            name: nameElem || null,
            email: emailElem || null,
            address: addressElem || null,
            phone: phoneElem || null
        };

        this.nameElem.value = '';
        this.emailElem.value ='';
        this.addressElem.value ='';
        this.phoneElem.value = '';

        this.add(data);
        this.updateList();

    }

    onSave(event, id, key) {
        if (event.code != 'Enter' || !event.ctrlKey) return;

        const data = {};
        data[key] = event.target.textContent;

        this.edit(id, data);
        this.updateList();
        event.target.setAttribute('contenteditable', false);
    }

    onRemove(event, id) {
        this.remove(id);
        this.updateList();
    }

}


new ContactsApp();