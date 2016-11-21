var init = require('./init');

describe('weatherTo', function() {
  it('should add location', function() {
    init();

        // element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    element(by.css('.nav-link-show-categories')).click();
    element(by.css('.btn-add-category')).click();

    element(by.model('catFormModel.name')).sendKeys('Skiing');
    element(by.model('catFormModel.temperature.min')).sendKeys('-10');
    element(by.model('catFormModel.temperature.max')).sendKeys('30');

    element(by.css('.btn-save-category')).click();


    var modalList = element.all(by.css('.wt-modal-body-categories .wt-table-row-categories'));
    // var list = element.all(by.repeater('cat in cats'));
    expect(modalList.count()).toEqual(5);
    expect(modalList.get(4).getText()).toContain('Skiing');

    element(by.css('.modal .close')).click();

    browser.wait(
      protractor.ExpectedConditions.visibilityOf(
          element(by.css('.wt-agenda-list-item-category')
      )
    ), 50000);

    var list = element.all(by.css('.wt-agenda-list-item-category'));
    expect(list.count()).toEqual(5);
    expect(list.get(4).getText()).toContain('Skiing');
  });
});
