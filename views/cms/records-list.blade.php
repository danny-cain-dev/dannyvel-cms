@extends($layout ?? 'layouts.main')

@section('title', $type->name)

@section('head')

@endsection

@section('content')
    <div class="container-fluid">
        <h1>{{ $type->name }}</h1>
        <table class="table">
            <tr>
                <th>Name</th>
                @foreach($type->summaryFields as $field)
                    <th>{{ $field }}</th>
                @endforeach
            </tr>
            @foreach($records as $record)
                <tr>
                    @can(Dannyvel\Plugins\CMS\Enums\CMSPermissionsEnum::EditRecord, $record)
                        <td><a href="{{ route('cms.edit.'.$type->type, $record->id) }}">{{ $record->name }}</a></td>
                    @else
                        <td>{{ $record->name }}</td>
                    @endcan

                    @foreach($type->summaryFields as $field)
                        <td>{{ $record->{$field} }}</td>
                    @endforeach
                </tr>
            @endforeach
        </table>

        {{ $records->links() }}

        <a href="{{ route('cms.create.'.$type->type) }}" class="btn btn-outline-primary">+ New {{ $type->name }}</a>
    </div>
@endsection
