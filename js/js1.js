(function(ko, $, undefined) {
ko.bindingHandlers.flash = {
    init: function(element) {
        $(element).hide();
    },
    update: function(element, valueAccessor) {
		
        $.ajax({
				type: "GET",
				//url: 'http://jelenakocic/books/books.xml',
				url: "http://kocicjelena.github.io/books/books.xml",
				crossDomain: true,
				//Content-type: "application/xml",
				//Access-Control-Allow-Origin: "http://localhost:8070",
				dataType: "xml",
				success: function(xml) {
					$(xml).find('books').each(function(){
						var id = $(this).find('id').text();
						var url = $(this).find('url').text();
						var title = $(this).find('title').text();
						$('<div class="items" id="link_'+id+'"></div>').html('<a href="'+url+'">'+title+'</a>').appendTo('#page-wrap');
						$(this).find('identifier').each(function(){
							var type = $(this).find('type').text();
							var value = $(this).find('value').text();
							$('<div class="type"></div>').html(type).appendTo('#link_'+id);
							$('<div class="value"></div>').html(value).appendTo('#link_'+id);
						});
					});
				}
			});
 
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value) {
            $(element).stop().hide().text(value).fadeIn(function() {
                clearTimeout($(element).data("timeout"));
                $(element).data("timeout", setTimeout(function() {
                    $(element).fadeOut();
                    valueAccessor()(null);
                }, 3000));
            });
        }
    },
    timeout: null
};

var Book = function(id, name, genre, publish_date) {
    this.id = id;
    this.name = ko.observable(name);
    this.genre = genre;
	this.publish_date = publish_date;
};

var Table = function(id, books) {
    this.books = ko.observableArray(books);
    this.books.id = id;
};

var SeatingChartModel = function(tables, availableBooks) {
    var self = this;
    this.tables = ko.observableArray(tables);
    this.availableBooks = ko.observableArray(availableBooks);
    this.availableBooks.id = "Available Books";
    this.lastAction = ko.observable();
	this.lastBook = ko.observable();
    this.lastError = ko.observable();
    this.maximumBooks = 4;
    this.isTableFull = function(parent) {
        return parent().length < self.maximumBooks;
    };

    this.updateLastAction = function(arg) {
        self.lastAction("Moved " + arg.item.name() + " from " + arg.sourceParent.id + " (seat " + (arg.sourceIndex + 1) + ") to " + arg.targetParent.id + " (seat " + (arg.targetIndex + 1) + ")");
    };

    //verify that if a fourth member is added, there is at least one member of each genre
    this.verifyAssignments = function(arg) {
        var genre, found,
            parent = arg.targetParent;

        if (parent.id !== "Available Books" && parent().length === 3 && parent.indexOf(arg.item) < 0) {
            genre = arg.item.genre;
            if (!ko.utils.arrayFirst(parent(), function(book) { return book.genre !== genre;})) {
                self.lastError("Cannot move " + arg.item.name() + " to " + arg.targetParent.id + " because there would be too many " + genre + " books");
                arg.cancelDrop = true;
            }
        }
    };
};

var extraBooks = [
    new Book(16, "Parker", "male", "02/02/1987"),
    new Book(17, "Dennis", "male", "02/02/1987"),
    new Book(18, "Angel", "female", "02/02/1987")
];

var initialTables = [
    new Table("Table One",  [
        new Book(1, "Bobby", "male", "02/02/1987"),
        new Book(2, "Ted", "male", "02/02/1987"),
        new Book(3, "Jim", "male", "02/02/1987")
    ]),
    new Table("Table Two", [
        new Book(4, "Michelle", "female", "02/02/1987"),
        new Book(5, "Erin", "female", "02/02/1987"),
        new Book(6, "Chase", "male", "02/02/1987")
    ]),
    new Table("Table Three", [
        new Book(7, "Denise", "female", "02/02/1987"),
        new Book(8, "Chip", "male", "02/02/1987"),
        new Book(9, "Kylie", "female", "02/02/1987")
    ]),
    new Table("Table Four", [
        new Book(10, "Cheryl", "female", "02/02/1987"),
        new Book(11, "Doug", "male", "02/02/1987"),
        new Book(12, "Connor", "male", "02/02/1987")
    ]),
    new Table("Table Five", [
        new Book(13, "Cody", "male", "02/02/1987"),
        new Book(14, "Farrah", "female", "02/02/1987"),
        new Book(15, "Lyla", "female", "02/02/1987")
    ])
];

var vm = new SeatingChartModel(initialTables, extraBooks);

ko.bindingHandlers.sortable.beforeMove = vm.verifyAssignments;
ko.bindingHandlers.sortable.afterMove = vm.updateLastAction;

ko.applyBindings(vm);
})(ko, jQuery);
