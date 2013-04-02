
describe('Observable Array', function() {
    beforeEach(function () {
        testObservableArray = new ko.observableArray([1, 2, 3]);
        notifiedValues = [];
        testObservableArray.subscribe(function (value) {
            notifiedValues.push(value ? value.slice(0) : value);
        });
        beforeNotifiedValues = [];
        testObservableArray.subscribe(function (value) {
            beforeNotifiedValues.push(value ? value.slice(0) : value);
        }, null, "beforeChange");
    });

    it('Should be observable', function () {
        expect(ko.isObservable(testObservableArray)).toEqual(true);
    });

    it('Should initialize to empty array if you pass no args to constructor', function() {
        var instance = new ko.observableArray();
        expect(instance().length).toEqual(0);
    });

    it('Should require constructor arg, if given, to be array-like or null or undefined', function() {
        // Try non-array-like args
        var threw;
        try { threw = false; new ko.observableArray(1); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; new ko.observableArray({}); } catch(ex) { threw = true }
        expect(threw).toEqual(true);

        // Try allowed args
        expect((new ko.observableArray([1,2,3]))().length).toEqual(3);
        expect((new ko.observableArray(null))().length).toEqual(0);
        expect((new ko.observableArray(undefined))().length).toEqual(0);
    });

    it('Should be able to write values to it', function () {
        testObservableArray(['X', 'Y']);
        expect(notifiedValues.length).toEqual(1);
        expect(notifiedValues[0][0]).toEqual('X');
        expect(notifiedValues[0][1]).toEqual('Y');
    });

    it('Should be able to mark single items as destroyed', function() {
        var x = {}, y = {};
        testObservableArray([x, y]);
        testObservableArray.destroy(y);
        expect(testObservableArray().length).toEqual(2);
        expect(x._destroy).toEqual(undefined);
        expect(y._destroy).toEqual(true);
    });

    it('Should be able to mark multiple items as destroyed', function() {
        var x = {}, y = {}, z = {};
        testObservableArray([x, y, z]);
        testObservableArray.destroyAll([x, z]);
        expect(testObservableArray().length).toEqual(3);
        expect(x._destroy).toEqual(true);
        expect(y._destroy).toEqual(undefined);
        expect(z._destroy).toEqual(true);
    });

    it('Should be able to mark all items as destroyed by passing no args to destroyAll()', function() {
        var x = {}, y = {}, z = {};
        testObservableArray([x, y, z]);
        testObservableArray.destroyAll();
        expect(testObservableArray().length).toEqual(3);
        expect(x._destroy).toEqual(true);
        expect(y._destroy).toEqual(true);
        expect(z._destroy).toEqual(true);
    });

    it('Should notify subscribers on push', function () {
        testObservableArray.push("Some new value");
        expect(notifiedValues).toEqual([[1, 2, 3, "Some new value"]]);
    });

    it('Should notify "beforeChange" subscribers before push', function () {
        testObservableArray.push("Some new value");
        expect(beforeNotifiedValues).toEqual([[1, 2, 3]]);
    });

    it('Should notify subscribers on pop', function () {
        var popped = testObservableArray.pop();
        expect(popped).toEqual(3);
        expect(notifiedValues).toEqual([[1, 2]]);
    });

    it('Should notify "beforeChange" subscribers before pop', function () {
        var popped = testObservableArray.pop();
        expect(popped).toEqual(3);
        expect(beforeNotifiedValues).toEqual([[1, 2, 3]]);
    });

    it('Should notify subscribers on splice', function () {
        var spliced = testObservableArray.splice(1, 1);
        expect(spliced).toEqual([2]);
        expect(notifiedValues).toEqual([[1, 3]]);
    });

    it('Should notify "beforeChange" subscribers before splice', function () {
        var spliced = testObservableArray.splice(1, 1);
        expect(spliced).toEqual([2]);
        expect(beforeNotifiedValues).toEqual([[1, 2, 3]]);
    });

    it('Should notify subscribers on remove by value', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        var removed = testObservableArray.remove("Beta");
        expect(removed).toEqual(["Beta"]);
        expect(notifiedValues).toEqual([["Alpha", "Gamma"]]);
    });

    it('Should notify subscribers on remove by predicate', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        var removed = testObservableArray.remove(function (value) { return value == "Beta"; });
        expect(removed).toEqual(["Beta"]);
        expect(notifiedValues).toEqual([["Alpha", "Gamma"]]);
    });

    it('Should notify subscribers on remove multiple by value', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        var removed = testObservableArray.removeAll(["Gamma", "Alpha"]);
        expect(removed).toEqual(["Alpha", "Gamma"]);
        expect(notifiedValues).toEqual([["Beta"]]);
    });

    it('Should clear observable array entirely if you pass no args to removeAll()', function() {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        var removed = testObservableArray.removeAll();
        expect(removed).toEqual(["Alpha", "Beta", "Gamma"]);
        expect(notifiedValues).toEqual([[]]);
    });

    it('Should notify "beforeChange" subscribers before remove', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        beforeNotifiedValues = [];
        var removed = testObservableArray.remove("Beta");
        expect(removed).toEqual(["Beta"]);
        expect(beforeNotifiedValues).toEqual([["Alpha", "Beta", "Gamma"]]);
    });

    it('Should not notify subscribers on remove by value with no match', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        var removed = testObservableArray.remove("Delta");
        expect(removed).toEqual([]);
        expect(notifiedValues).toEqual([]);
    });

    it('Should not notify "beforeChange" subscribers before remove by value with no match', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        beforeNotifiedValues = [];
        var removed = testObservableArray.remove("Delta");
        expect(removed).toEqual([]);
        expect(beforeNotifiedValues).toEqual([]);
    });

    it('Should modify original array on remove', function () {
        var originalArray = ["Alpha", "Beta", "Gamma"];
        testObservableArray(originalArray);
        notifiedValues = [];
        var removed = testObservableArray.remove("Beta");
        expect(originalArray).toEqual(["Alpha", "Gamma"]);
    });

    it('Should modify original array on removeAll', function () {
        var originalArray = ["Alpha", "Beta", "Gamma"];
        testObservableArray(originalArray);
        notifiedValues = [];
        var removed = testObservableArray.removeAll();
        expect(originalArray).toEqual([]);
    });

    it('Should notify subscribers on replace', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        notifiedValues = [];
        testObservableArray.replace("Beta", "Delta");
        expect(notifiedValues).toEqual([["Alpha", "Delta", "Gamma"]]);
    });

    it('Should notify "beforeChange" subscribers before replace', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        beforeNotifiedValues = [];
        testObservableArray.replace("Beta", "Delta");
        expect(beforeNotifiedValues).toEqual([["Alpha", "Beta", "Gamma"]]);
    });

    it('Should notify subscribers after marking items as destroyed', function () {
        var x = {}, y = {}, didNotify = false;
        testObservableArray([x, y]);
        testObservableArray.subscribe(function(value) {
            expect(x._destroy).toEqual(undefined);
            expect(y._destroy).toEqual(true);
            didNotify = true;
        });
        testObservableArray.destroy(y);
        expect(didNotify).toEqual(true);
    });

    it('Should notify "beforeChange" subscribers before marking items as destroyed', function () {
        var x = {}, y = {}, didNotify = false;
        testObservableArray([x, y]);
        testObservableArray.subscribe(function(value) {
            expect(x._destroy).toEqual(undefined);
            expect(y._destroy).toEqual(undefined);
            didNotify = true;
        }, null, "beforeChange");
        testObservableArray.destroy(y);
        expect(didNotify).toEqual(true);
    });

    it('Should be able to return first index of item', function () {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        expect(testObservableArray.indexOf("Beta")).toEqual(1);
        expect(testObservableArray.indexOf("Gamma")).toEqual(2);
        expect(testObservableArray.indexOf("Alpha")).toEqual(0);
        expect(testObservableArray.indexOf("fake")).toEqual(-1);
    });

    it('Should return 0 when you call myArray.length, and the true length when you call myArray().length', function() {
        testObservableArray(["Alpha", "Beta", "Gamma"]);
        expect(testObservableArray.length).toEqual(0); // Because JavaScript won't let us override "length" directly
        expect(testObservableArray().length).toEqual(3);
    });

    it('Should be able to call standard mutators without creating a subscription', function() {
        var timesEvaluated = 0,
            newArray = ko.observableArray(["Alpha", "Beta", "Gamma"]);

        var computed = ko.computed(function() {
            // Make a few standard mutations
            newArray.push("Delta");
            newArray.remove("Beta");
            newArray.splice(2, 1);

            // Peek to ensure we really had the intended effect
            expect(newArray.peek()).toEqual(["Alpha", "Gamma"]);

            // Also make use of the KO delete/destroy functions to check they don't cause subscriptions
            newArray([{ someProp: 123 }]);
            newArray.destroyAll();
            expect(newArray.peek()[0]._destroy).toEqual(true);
            newArray.removeAll();
            expect(newArray.peek()).toEqual([]);

            timesEvaluated++;
        });

        // Verify that we haven't caused a subscription
        expect(timesEvaluated).toEqual(1);
        expect(newArray.getSubscriptionsCount()).toEqual(0);

        // Don't just trust getSubscriptionsCount - directly verify that mutating newArray doesn't cause a re-eval
        newArray.push("Another");
        expect(timesEvaluated).toEqual(1);
    });

    it('Should return true when you call isObservableArray', function() {
        expect(testObservableArray.isObservableArray).toBeTruthy();
    });

    it('Should throw an exception if value passed to observable array is not of array, null or undefined', function() {
        var threw;

        // should not throw exception
        try { threw = false; testObservableArray([]); } catch(ex) { threw = true }
        expect(threw).toEqual(false);
        try { threw = false; testObservableArray([5,6,7]); } catch(ex) { threw = true }
        expect(threw).toEqual(false);
        try { threw = false; testObservableArray([{'size': 10}]); } catch(ex) { threw = true }
        expect(threw).toEqual(false);
        try { threw = false; testObservableArray(null); } catch(ex) { threw = true }
        expect(threw).toEqual(false);
        try { threw = false; testObservableArray(undefined); } catch(ex) { threw = true }
        expect(threw).toEqual(false);
        try { threw = false; testObservableArray(); } catch(ex) { threw = true }
        expect(threw).toEqual(false);

        // should throw exception
        try { threw = false; testObservableArray('test value'); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; testObservableArray(true); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; testObservableArray(10); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; testObservableArray({'size': 10}); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; testObservableArray(new Date()); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
        try { threw = false; testObservableArray(function(){return true;}); } catch(ex) { threw = true }
        expect(threw).toEqual(true);
    });
});
