@extends('layouts.main')

@section('title', $record->id ? 'Edit '.$record->title : 'New '.$type->name)

@section('head')

@endsection

@section('content')
    <div class="container-fluid">
        <h1>
            @if ($record->id)
                Edit {{ $record->title }}
            @else
                New {{ $type->name }}
            @endif
        </h1>

        @if ($errors->any())
            <div class="alert alert-danger">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ $record->id ? route('cms.edit.'.$type->type, $record->id) : route('cms.store.'.$type->type) }}">
            @csrf
            <div class="row">
                <div class="col-md-8">
                    @foreach($fields as $field)
                        <div class="form-group">
                            <span class="label">
                                {{ $field->caption }}
                                @if ($field->required)
                                    *
                                @endif
                            </span>
                            <div data-vue="{{ $field->component }}" data-vue-props="{{ json_encode($field->componentConfig) }}">
                                <input type="text" disabled class="form-control" />
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="col-md-4">
                    @foreach($relationships as $field)
                        <div class="form-group">
                            <span class="label">{{ $field->caption }}</span>
                            <div data-vue="{{ $field->component }}" data-vue-props="{{ json_encode($field->componentConfig) }}"></div>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Save" />
            </div>
        </form>
    </div>
@endsection
