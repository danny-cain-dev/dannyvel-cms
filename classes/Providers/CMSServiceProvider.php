<?php

namespace Dannyvel\Plugins\CMS\Providers;

use Illuminate\Support\ServiceProvider;

class CMSServiceProvider extends ServiceProvider {
    public function boot() {
        $this->publishes([
            dirname(__DIR__, 2) . '/assets/vendor/cms' => public_path('vendor/cms/')
        ], 'assets');
        $this->loadRoutesFrom(dirname(__DIR__, 2).'/routes.php');
        $this->loadMigrationsFrom(dirname(__DIR__, 2).'/migrations');
        $this->loadViewsFrom(dirname(__DIR__, 2).'/views/', 'dannyvel');

        $this->app->singleton(CMSProvider::class, function() {
            return new CMSProvider();
        });
    }

    public function register() {

    }
}
