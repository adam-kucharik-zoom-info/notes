(function () {
    const color = {
        BLUE: {
            key: 'BLUE',
            text: 'Blue',
            value: 'lightblue'
        },
        GRAY: {
            key: 'GRAY',
            text: 'Gray',
            value: 'lightgray'
        },
        GREEN: {
            key: 'GREEN',
            text: 'Green',
            value: 'lightgreen'
        },
        PINK: {
            key: 'PINK',
            text: 'Pink',
            value: 'lightpink'
        },
        YELLOW: {
            key: 'YELLOW',
            text: 'Yellow',
            value: 'lightyellow'
        },
    };
    
    class Note {
        constructor () {
            this.color = color.GRAY.key;
            this.text = '';
        }
    }
    
    class NoteView {
        constructor (model, listView) {
            this.$el = $('<li class="note"></li>');
            this.model = model;
            this.listView = listView;
            
            // Initialize events
            this.$el.on('change', 'select', ($event) => { this.onColorChange($event); });
            this.$el.on('click', '.note-delete', ($event) => { this.onDelete($event); });
        }
        
        render () {
            // TODO: Add unique ids and <label for="id"> for accessibility
            this.$el.html(
                '<label>Color</label> ' +
                '<select class="note-color"></select>' +
                '<textarea class="note-text">' + this.model.text + '</textarea>' +
                '<button class="note-delete">Delete</button>'
            );
            
            this.$color = this.$el.find('.note-color');
            
            for (let c in color) {
                this.$color.append($('<option value=' + color[c].key + '>' + color[c].text + '</option>'));
            }
            
            this.$color.val(this.model.color);
            
            this.update();
            
            return this;
        }
        
        update () {
            // TODO: Apply class instead of inline style so colors can be managed in CSS
            this.$el.css('backgroundColor', color[this.model.color].value);
        }
        
        onColorChange () {
            this.model.color = this.$color.val();
            this.update();
        }
        
        // TODO: Not thrilled about the circular reference, but it works for a tight turnaround.
        onDelete ($event) {
            this.listView.delete(this);
        }
    }
    
    class NoteListView {
        constructor (model, childView) {
            this.$el = $('<div></div>');
            this.$list = null;
            this.model = model;
            this.childView = childView;
            this.childViews = [];
            
            this.model.notes.forEach(function (note) {
                this.addChildView(note);
            }, this);
        }
        
        render () {
            this.$el.html('<ul id="noteList" class="note-list"></ul>');
            this.$list = this.$el.find('#noteList');
            
            this.childViews.forEach(function (view) {
                this.$list.append(view.render().$el);
            }, this);
            
            return this;
        }
        
        update (action, note) {
            if (action === 'add') {
                this.$list.prepend(this.addChildView(note).render().$el);
            }
        }
        
        addChildView (note) {
            const view = new this.childView(note, this);
            this.childViews.unshift(view);
            
            return view;
        }
        
        delete (view) {
            const i = this.childViews.indexOf(view);
            this.model.notes.splice(i);
            this.childViews[i].$el.remove();
            this.childViews.splice(i, 1);
        }
    }
    
    class AppView {
        constructor (model) {
            this.$el = $('<div></div>');
            this.model = model;
            this.noteListView = null;
            
            // Initialize events
            this.$el.on('click', '#add', () => { this.add(); });
        }
        
        render () {
            this.$el.html(
                '<ul class="unbulleted-list">' +
                    '<li><button id="add">Add a Note</button></li>' +
                '</ul>'
            );
            
            this.noteListView = new NoteListView(this.model, NoteView);
            this.$el.append(this.noteListView.render().$el);
            
            return this;
        }
        
        add () {
            const note = new Note();
            this.model.notes.unshift(note);
            this.noteListView.update('add', note);
        }
    }
    
    const appModel = {
        notes: []
    };
    
    const appView = new AppView(appModel);
    
    appView.render().$el.appendTo($('#app'));
})();