import React from 'react';
import { connect } from 'react-redux';

interface SomeVeryLongComponentNameProps {
    property_a: string;
    property_b: string;
    property_c: string;
    property_d: string;
    property_e: string;
    property_f: string;
}

export default connect()((props: SomeVeryLongComponentNameProps) => <div />);
