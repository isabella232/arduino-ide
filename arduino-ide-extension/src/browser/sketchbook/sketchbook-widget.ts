import { injectable, postConstruct, inject } from 'inversify';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { MaybePromise } from '@theia/core/lib/common/types';
import { ViewContainer } from '@theia/core/lib/browser/view-container';
import { StatefulWidget } from '@theia/core/lib/browser/shell/shell-layout-restorer';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { BaseWidget, Message, Widget, MessageLoop } from '@theia/core/lib/browser/widgets/widget';
import { SketchWidgetFactory } from './sketch-widget';
import { SketchesService, Sketch } from '../../common/protocol';
import { Disposable } from '@theia/core';
import { SketchbookViewContainerFactory } from './sketchbook-view-container';

@injectable()
export class SketchbookWidget extends BaseWidget implements StatefulWidget, ApplicationShell.TrackableWidgetProvider {

    static WIDGET_ID = 'sketchbook-widget';
    static WIDGET_LABEL = 'Sketchbook';

    @inject(SketchesService)
    protected readonly sketchesService: SketchesService;

    @inject(SketchbookViewContainerFactory)
    protected readonly viewContainerFactory: SketchbookViewContainerFactory;

    @inject(SketchWidgetFactory)
    protected readonly widgetFactory: SketchWidgetFactory;

    protected viewContainer: ViewContainer;
    protected readonly deferredContainer = new Deferred<HTMLElement>();

    protected toolbar: Widget;
    protected contentNode: HTMLElement;
    protected toolbarNode: HTMLElement;

    @postConstruct()
    protected init(): void {
        this.id = SketchbookWidget.WIDGET_ID;
        this.title.label = SketchbookWidget.WIDGET_LABEL;
        this.title.caption = SketchbookWidget.WIDGET_LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-book';
        this.addClass('sketchbook-widget');

        this.contentNode = document.createElement('div');
        this.contentNode.classList.add('sketchbook-content');
        this.toolbarNode = document.createElement('div');
        this.toolbarNode.classList.add('sketchbook-toolbar');
        this.contentNode.appendChild(this.toolbarNode);
        this.node.appendChild(this.contentNode);

        this.toolbar = new Widget();
        this.toolbar.title.caption = 'Toolbar';
        this.toolbar.title.label = 'Toolbar';
        this.toolbar.addClass('sketchbook-widget-toolbar');

        this.viewContainer = this.viewContainerFactory({
            id: `${SketchbookWidget.WIDGET_ID}-view-container`
        });
        this.scrollOptions = {
            suppressScrollX: true,
            minScrollbarLength: 35
        };

        this.loadSketches();

        this.toDispose.push(
            this.viewContainer
        );
        this.update();
    }

    protected async loadSketches(sketches: MaybePromise<Sketch[]> = this.sketchesService.getSketches()): Promise<void> {
        for (const sketch of await sketches) {
            const widget = this.widgetFactory({ sketch });
            this.viewContainer.addWidget(widget, {
                canHide: false,
                initiallyCollapsed: true
            });
        }
        this.update();
        this.updateScrollBar();
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        Widget.attach(this.toolbar, this.toolbarNode);
        Widget.attach(this.viewContainer, this.contentNode);
        this.toDisposeOnDetach.push(Disposable.create(() => Widget.detach(this.toolbar)));
        this.toDisposeOnDetach.push(Disposable.create(() => Widget.detach(this.viewContainer)));
        this.updateScrollBar();
        this.deferredContainer.resolve(this.viewContainer.node);
        // TODO: focus the desired HTMLElement
    }

    protected onResize(message: Widget.ResizeMessage): void {
        super.onResize(message);
        MessageLoop.sendMessage(this.viewContainer, Widget.ResizeMessage.UnknownSize);
    }

    protected onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.onResize(Widget.ResizeMessage.UnknownSize);
    }

    getTrackableWidgets(): Widget[] {
        return this.viewContainer.getTrackableWidgets();
    }

    storeState(): object {
        return this.viewContainer.storeState();
    }

    restoreState(oldState: ViewContainer.State): void {
        this.viewContainer.restoreState(oldState);
    }

    protected getScrollContainer(): MaybePromise<HTMLElement> {
        return this.deferredContainer.promise;
    }

    updateScrollBar(): void {
        if (this.scrollBar) {
            this.scrollBar.update();
        }
    }

}
