import { connect } from 'react-redux';
import { Link } from 'react-router';
import { getWorkshops } from '../actions/workshops';
import { getSessions } from '../actions/sessions';
import { Page, PageHeading, Container } from '../components/page';
import { Block, BlockHeading, Columns, Column, BackgroundImage, ColumnHeading, P } from '../components/textblock';
import { CenteredBlock, CenteredHeader, CenteredContent } from '../components/centeredblock';
import { find, sortBy, includes, reduce, compose, get } from 'lodash/fp';

const workshops = [
    "internet_of_things_for_everyone",
    "advanced_docker_workshop",
    "let_the_good_times_flow__buildin",
    "angular2_med_typescript",
    "introduction_to_react_native",
    "alt_du_ikke_visste_om_chrome_dev",
    "vr_for_alle",
    "law_and_order_in_la__to_process_"
];

const sortIndexes = {
    'lightning-talk' : 2,
    'presentation': 1,
    'workshop': 0
};

const groupByFormat = reduce((acc, session) => {
    let key = find({format: session.format}, acc);
    if (!key) {
        key = {
            format: session.format,
            sessions: [],
            className: `sessions__format-title--${session.format}`,
            sortIndex: get(session.format)(sortIndexes)
        };
        acc.push(key);
    }

    key.sessions.push(session);
    return acc;
}, []);

const getTransformedWorkshops = compose(
    sortBy('sortIndex'),
    groupByFormat
);

function isWorkshop(workshop) {
    return includes(workshop.id, workshops);
}

const mooseheadId = title => title.toLowerCase().replace(/[^a-zæøå0-9\s]/g, '').replace(/\s/g, '_').substr(0, 32);

function workshopUrl(workshop) {
    if (!workshop) {
        return '#';
    }
    return `https://javazone.no/moosehead/#/register/${workshop.mooseheadId}`;
}

function workshopClass(workshop) {
    if (!workshop) {
        return 'button--disabled';
    }

    switch (workshop.status) {
    case 'FREE_SPOTS': return 'button--green';
    case 'FEW_SPOTS': return 'button--yellow';
    case 'FULL': return 'button--red';
    case 'VERY_FULL': return 'button--red';
    case 'CLOSED': return 'button--disabled';
    default: return 'button--disabled';
    }
}

function workshopStatus(workshop) {
    if (!workshop) {
        return 'Opens at August 12th, 12.00';
    }

    switch (workshop.status) {
    case 'FREE_SPOTS': return 'I want to attend!';
    case 'FEW_SPOTS': return 'Few spots left';
    case 'FULL': return 'Waiting list';
    case 'VERY_FULL': return 'No more spots';
    case 'CLOSED': return 'Registration closed';
    default: return 'Opens at August 12th, 12.00';
    }
}

const Workshop = (workshop, key) => (
    <li className='workshops__workshop workshop' key={key}>
        <span className='workshop__lang workshop__lang--desktop'>{workshop.language}</span>
        <div className='workshop__info'>
            <span className='workshop__lang workshop__lang--mobile'>{workshop.language}</span>
            <Link to={`/program/${workshop.id}`} className='workshop__title'>{workshop.title}</Link>
            <div className='workshop__starts'>
                {workshop.time} – {workshop.duration} hours
            </div>
            <div className='workshop__speakers'>
                {workshop.speakers}
            </div>
        </div>
        <a className={`${workshopClass(workshop)} workshop__status button`} href={workshopUrl(workshop)}>{workshopStatus(workshop)}</a>
    </li>
);

function mapStateToProps(state) {
    return {
        workshops: state.workshops.workshops,
        sessions: state.sessions.sessions
    };
}

function merge(workshops, sessions) {
    if (workshops.length === 0 || !sessions || sessions.sessions.length === 0) {
        return [];
    }

    return workshops.map((workshop) => {
        const s = find((session) => mooseheadId(session.title) === workshop.id, sessions.sessions);
        s.mooseheadId = workshop.id;
        s.status = workshop.status;
        return s;
    });
}

const Kids = React.createClass({
    componentWillMount() {
        this.props.getWorkshops();
        this.props.getSessions();
    },

    render() {
        const sessions = getTransformedWorkshops(this.props.sessions)[0];
        const workshops = sortBy('timestamp', merge(this.props.workshops.filter(isWorkshop), sessions));
        return (
            <Page name='workshops'>
                <Container>
                    <CenteredBlock>
                        <CenteredHeader>Welcome to the JavaZone 2016 Workshops!</CenteredHeader>
                        <CenteredContent>
                            <p>
                                For those of you who want to make the most of their JavaZone ticket we offer a selection of hands-on workshops that take place the day before JavaZone officially begins. To ensure a positive learning experience we’ve limited the spaces on each workshop, so you’ll have to register to secure your place. Registration opens at noon on Friday the 12th of August, so put a reminder in your calendar!
                            </p>
                        </CenteredContent>
                    </CenteredBlock>

                    <div className='workshop-list'>
                        <div className='workshop-list__title'>Workshops</div>
                        <ul className='workshop-list__workshops'>
                            {workshops.map(Workshop)}
                        </ul>
                    </div>
                </Container>
            </Page>
        );
    }
});

export default connect(mapStateToProps, { getWorkshops, getSessions })(Kids);
