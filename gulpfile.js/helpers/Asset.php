<?php

class Asset
{
    private static $json;

    private static function json($filename, $options = JSON_OBJECT_AS_ARRAY)
    {
        if (!isset(static::$json[ $filename ])) {
            $contents = @file_get_contents($filename);

            if ($contents === false) {
                throw new RuntimeException("Cannot load $filename (try running 'gulp build')");
            }

            static::$json[ $filename ] = json_decode($contents, $options);
        }

        return static::$json[ $filename ];
    }

    private static function settings()
    {
        return static::json(dirname(__DIR__) . '/settings.json', 0);
    }

    private static function root()
    {
        return dirname(dirname(__DIR__));
    }

    private static function dest()
    {
        $settings = static::settings();

        return static::root() . '/' . $settings->dest;
    }

    private static function filename($name)
    {
        $settings = static::settings();

        // Development mode - no versioning
        if ($settings->dev) {
            return $name;
        }

        // Webpack versioned files
        if (strpos($name, 'webpack/') === 0) {
            $filename = static::dest() . '/webpack/manifest.json';
            $manifest = static::json($filename);

            $name = substr($name, 8);
            if (isset($manifest[ $name ])) {
                return 'webpack/' . $manifest[ $name ];
            }

            throw new InvalidArgumentException("Cannot find asset '$name' in $filename (try running 'gulp build')");
        }

        // Gulp versioned files
        $filename = static::dest() . '/manifest.json';
        $manifest = static::json($filename);

        if (isset($manifest[ $name ])) {
            return $manifest[ $name ];
        }

        throw new InvalidArgumentException("Cannot find asset '$name' in $filename (try running 'gulp build')");
    }

    private static function escapeAttributes($attributes)
    {
        $properties = '';

        // Escape all the properties to be added to the link
        foreach ($attributes as $key => $prop) {
            $escKey = htmlspecialchars($key);
            $escValue = htmlspecialchars($prop);

            $properties .= " {$escKey}=\"{$escValue}\"";
        }

        return $properties;
    }

    private static function replaceHref(&$attributes, $key)
    {
        // Convert the passed url to the built file url
        if (!empty($attributes[$key])) {
            $attributes[$key] = static::url($attributes[$key]);
        }
    }

    public static function url($name)
    {
        $settings = static::settings();

        if ($settings->hot && strpos($name, 'webpack/') === 0) {
            // Hot module replacement using webpack-dev-server
            $name = substr($name, 8);

            return ($settings->webpackSsl ? 'https' : 'http') . "://{$settings->webpackHost}/$name";
        }

        return "{$settings->publicPath}/" . static::filename($name);
    }

    public static function path($name)
    {
        $settings = static::settings();

        if ($settings->hot && strpos($name, 'webpack/') === 0) {
            // No physical file exists in Hot mode - have to return the URL
            return static::url($name);
        }

        return static::dest() . '/' . static::filename($name);
    }

    public static function link($attributes)
    {
        $settings = static::settings();

        // Convert the href url to the built file url
        static::replaceHref($attributes, 'href');

        // Livereload doesn't work for stylesheets that have anything other than
        // rel="stylesheet", so always set a stylesheet in dev mode to that
        if (
            $settings->dev &&
            !empty($attributes['rel']) &&
            strpos($attributes['rel'], 'stylesheet') !== false
        ) {
            $attributes['rel'] = 'stylesheet';
        }

        // Escape all the attributes and format them correctly
        $properties = static::escapeAttributes($attributes);

        return "<link{$properties}>";
    }

    public static function script($attributes)
    {
        // Convert the href url to the built file url
        static::replaceHref($attributes, 'src');

        // Escape all the attributes and format them correctly
        $properties = static::escapeAttributes($attributes);

        return "<script{$properties}></script>";
    }

    public static function favicons()
    {
        return file_get_contents(static::dest() . '/favicons/meta.html');
    }

    public static function livereload()
    {
        return file_get_contents(static::dest() . '/livereload.html');
    }
}
