describe('weatherTo', function() {
  it('should add location', function() {
    browser.get('http://localhost:3000');

        // element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    element(by.css('.nav-link-show-locations')).click();
    element(by.css('.btn-show-add-location')).click();

    element(by.model('locationSearchText')).sendKeys('Minneapolis');

        // var list = element.all(by.css('.wt-location'));
    var list = element.all(by.repeater('loc in locationResults'));
    expect(list.count()).toEqual(3);
    expect(list.get(0).getText()).toContain('Minneapolis, MN, USA');
  });
});
