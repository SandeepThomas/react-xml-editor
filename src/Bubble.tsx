import * as React from 'react';

import { BubbleType, Actions, DocSpec, MenuItemSpecNoParameter, Xml } from './types';
import { askLongString, getXmlNode, hasActionParameter, updateNode } from './Util';

interface Props {
    actions: Actions;
    attribute: string;
    docSpec: DocSpec;
    element: string;
    id: string;
    left: number;
    show: boolean;
    top: number;
    type: BubbleType;
    value: string;
    xml: Xml;
}

export default class Bubble extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    public render(): React.ReactNode {
        const {
            id,
            show,
        } = this.props;
        if (!show) {
            return null;
        }

        if (id.match(/~\$~[^~]+$/)) {
            return this.getAttributeBubble();
        } else if (id.match(/~\$\$~[0-9]+$/)) {
            return this.getElementBubble();
        } else if (id.match(/~_$/)) {
            return this.getTextBubble();
        }

        return null;
    }

    private getTextBubble(): React.ReactNode {
        const { actions, id, left, top, value, xml } = this.props;
        return (
            <div className="nerd" id="xonomyBubble" style={{ left, top, display: 'block' }}>
                <div className="inside">
                    <div id="xonomyBubbleContent">
                        { askLongString({
                            actions,
                            defaultValue: value,
                            id,
                            xml,
                        }) }
                    </div>
                </div>
            </div>
        );
    }

    private getElementBubble(): React.ReactNode {
        const { actions, docSpec, element, id, left, top, xml } = this.props;

        if (docSpec.elements && docSpec.elements[element] && docSpec.elements[element].menu) {
            const menu = docSpec.elements[element].menu;
            const menuItems = menu?.map((menuItemSpec, index) => {
                if (!menuItemSpec.hideIf || !menuItemSpec.hideIf(getXmlNode(id.split('~'), xml))) {
                    return (
                        <div
                            className="menuItem focusme"
                            key={ index }
                            onClick={ async () => {
                                if (hasActionParameter(menuItemSpec)) {
                                    actions.setXml(await menuItemSpec.action(xml, id, menuItemSpec.actionParameter));
                                } else {
                                    actions.setXml(await (menuItemSpec as MenuItemSpecNoParameter).action(xml, id));
                                }
                                actions.showBubble({ show: false });
                            } }
                        >
                            { menuItemSpec.caption }
                        </div>
                    );
                }
                return null;
            });
            return (
                <div className="nerd" id="xonomyBubble" style={{ left, top, display: 'block' }}>
                    <div className="inside">
                        <div id="xonomyBubbleContent">
                            <div className="menu">
                                {menuItems}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    private getAttributeBubble(): React.ReactNode {
        const {
            actions,
            attribute,
            docSpec,
            id,
            element,
            left,
            top,
            type,
            value,
            xml,
        } = this.props;
        if (type === BubbleType.ASKER) {
            if (docSpec.elements &&
                docSpec.elements[element] &&
                docSpec.elements[element].attributes &&
                docSpec.elements[element].attributes[attribute] &&
                docSpec.elements[element].attributes[attribute].asker) {
                return (
                    <div className="nerd" id="xonomyBubble" style={{ left, top, display: 'block' }}>
                        <div className="inside">
                            <div id="xonomyBubbleContent">
                            { (docSpec.elements[element].attributes[attribute].asker as any)({
                                actions,
                                defaultValue: value,
                                id,
                                xml,
                            }) }
                            </div>
                        </div>
                    </div>
                );
            }
        } else if (type === BubbleType.MENU) {
            if (docSpec.elements &&
                docSpec.elements[element] &&
                docSpec.elements[element].attributes &&
                docSpec.elements[element].attributes[attribute] &&
                docSpec.elements[element].attributes[attribute].menu) {
                    const menu = docSpec.elements[element].attributes[attribute].menu;
                    const menuItems = menu?.map((menuItemSpec, index) => (
                        <div
                            className="menuItem focusme"
                            key={ index }
                            onClick={ async () => {
                                if (hasActionParameter(menuItemSpec)) {
                                    actions.setXml(await menuItemSpec.action(xml, id, menuItemSpec.actionParameter));
                                } else {
                                    actions.setXml(await (menuItemSpec as MenuItemSpecNoParameter).action(xml, id));
                                }
                                
                                actions.showBubble({ show: false });
                            } }
                        >
                            { menuItemSpec.caption }
                        </div>
                    ));

                    return (
                        <div className="nerd" id="xonomyBubble" style={{ left, top, display: 'block' }}>
                            <div className="inside">
                                <div id="xonomyBubbleContent">
                                    <div className="menu">
                                        {menuItems}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
            }
        }
        return null;
    }

    private onSubmit(event: React.FormEvent<HTMLFormElement>): void {
        const { actions, id, value, xml } = this.props;
        actions.setXml(updateNode(xml, id, value));
        actions.showBubble({
            show: false,
        });
        event.preventDefault();
    }

    private onChange(event: React.FormEvent<HTMLInputElement>): void {
        const { actions } = this.props;
        actions.showBubble({
            value: (event.target as HTMLInputElement).value,
        });
    }
}
