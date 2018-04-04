import * as React from 'react';
import { Button, TextField } from 'material-ui';
import { Course } from './CourseModel';
import * as actions from './actions';
import { Routes, Route } from '../api/routes';
import { CourseStoreState } from './CourseStore';
import { connect, Dispatch } from 'react-redux';

interface SearchCourse {
    onSearch: (query?: string) => void;
    routes: (route: Route) => {href:string, onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void };
    query?: string;
    courses: Course[];
}

class SearchCourse extends React.Component<SearchCourse, object> {

    textInput: HTMLInputElement;

    onButtonClick() {
        this.props.onSearch(this.textInput.value);
    }

    render() {
        console.log('render')
        return <div className="courses">
                <div className="coursesSearch">
                    <TextField id="txtCourseSearch" inputRef={(input: any) => { this.textInput = input; }} />
                    <Button color="primary" onClick={this.onButtonClick.bind(this)} variant="raised">Search</Button>
                </div>
                {
                    (this.props.courses ?
                        this.props.courses.map((course) => (                            
                            <a key={course.uuid} href={this.props.routes(Routes.CourseEdit.create(course.uuid)).href} onClick={
                                this.props.routes(Routes.CourseEdit.create(course.uuid)).onClick}>
                                <div>
                                    <h2>{course.name}</h2>
                                    {course.code}
                                </div>
                            </a>))
                        : <div></div>
                    )
                }
            </div>
    }
}

function mapStateToProps(state: CourseStoreState) {
    return {
        query: state.query,
        courses: state.courses
    };
}

function mapDispatchToProps(dispatch: Dispatch<actions.CoursesAction>) {
    return {
        onSearch: (query?: string) => dispatch(actions.fetchCourses(query))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCourse as any);