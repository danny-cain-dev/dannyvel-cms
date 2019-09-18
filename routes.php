<?php

Route::namespace("DannyVel\\Plugins\\CMS\\Controllers")->middleware(["web", "auth:api"])->prefix("api/cms")->group(function() {
    // example routes
    /*
    Route::get('/pages/', 'CMSController@index')->defaults('type', 'pages')->name('cms.list.pages');
    Route::post('/pages', 'CMSController@store')->defaults('type', 'pages')->name('cms.store.page');
    Route::get('/pages/{$id}', 'CMSController@edit')->defaults('type', 'pages')->name('cms.edit.page');
    Route::post('/pages/{$id}', 'CMSController@update')->defaults('type', 'pages')->name('cms.update.page');
    */
    Route::get('lookup', 'CMSApiController@lookup')->name('cms.lookup');
});
