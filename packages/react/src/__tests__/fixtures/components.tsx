import * as React from "react";

import { myContext } from "./contexts";

// tslint:disable

export const MyComponent: React.FC<{ foo, bar }> = ({ foo, bar }): JSX.Element => {
    if (!foo) return <span>{bar}</span>;

    if (foo < 0) {
        return <span className="lower">{foo}</span>;
    } else if (foo > 0) {
        return <span className="higher">{foo}</span>;
    }

    return <span>{foo}</span>;
};

export function Toggle(props) {
    const [state, setState] = React.useState(false);
    return (
        <button
            onClick={() => {
                setState(previousState => !previousState);
                props.onChange(!state);
            }}
            data-testid="toggle"
        >
            {state === true ? "Turn off" : "Turn on"}
        </button>
    );
}

export function Card(props) {
    React.useEffect(() => {
        const timeoutID = setTimeout(() => {
            props.onSelect(null);
            props.onRender && props.onRender();
        }, 5000);
        props.onRender && props.onRender();
        return () => {
            clearTimeout(timeoutID);
        };
    }, [props.onSelect, props.onRender]);
    return [1, 2, 3, 4].map(choice => (
        <button
            key={choice}
            className={"alex" + choice}
            onClick={() => props.onSelect(choice)}
        >
            {choice}
        </button>
    ));
}

export function User(props) {
    const [user, setUser] = React.useState(null);
    const context = React.useContext(myContext);

    context.callMe();

    async function fetchUserData(id) {
        const response = await fetch("/" + id);
        setUser(await response.json());
    }

    React.useEffect(() => {
        fetchUserData(props.id);
    }, [props.id]);

    if (!user) {
        return "loading...";
    }

    return (
        <details>
            <summary>{user.name}</summary>
            <strong>{user.age}</strong> years old
            <br />
            <span>lives in </span>
            <span>{user.address}</span>
        </details>
    );
}

export class AlexClass extends React.Component<{}, {}> {

    static contextType = myContext;

    state = {
        alex: "alex"
    };

    render() {
        this.context.callMe();
        return <div><span className="iamspan"></span></div>;
    }
}
