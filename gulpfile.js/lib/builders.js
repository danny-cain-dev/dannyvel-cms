const builders = [];

/**
 * Specify a gulp task that should be run as a sub-task of the 'build' and 'dev' tasks
 */
export function add(name)
{
    builders.push(name);
}

export function all()
{
    return builders;
}
