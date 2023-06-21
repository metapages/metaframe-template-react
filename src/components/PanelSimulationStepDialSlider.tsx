import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Matter from 'matter-js';
import Quaternion, { fromEuler } from 'quaternion';

import { useMetaframe } from '@metapages/metaframe-hook';

const fillStyleBlocks = "#828583";
const fillStyleTeeth = "#828583";
const rectOverCircleTeeth = true;

/**
 * Step dial
 *
 */
export const PanelSimulationStepDialSlider: React.FC = () => {
  const forceRef = useRef<number>(0);
  const [body, setBody] = useState<Matter.Body | null>(null);

  // The core code
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.innerHTML = "";

    // 📐📐📐📐📐📐📐📐📐📐📐📐📐
    // 📐 📐 📐  BEGIN PHYSICS CODE
    // 📐 BEGIN COMMON PREAMBLE
    // module aliases
    var Engine = Matter.Engine,
      Events = Matter.Events,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Constraint = Matter.Constraint,
      Composites = Matter.Composites,
      Vector = Matter.Vector,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Composite = Matter.Composite;
    // create an engine
    var engine = Engine.create({
      positionIterations: 20,
      velocityIterations: 10,
    });
    var world = engine.world;
    // create a renderer
    var render = Render.create({
      element: document.getElementById("matter-js")!,
      engine,
      options: {
        width: 1000,
        height: 600,
        showAngleIndicator: true,
        showAxes: true,
        // showConvexHulls: true,
        showVelocity: true,
        // pixelRatio: 3,
        wireframes: false,
      },
    });
    // 📐 END COMMON PREAMBLE
    // 📐📐 BEGIN ACTUAL CODE
    // https://brm.io/matter-js/docs/
    // 📐📐📐📐📐📐📐📐📐📐📐📐📐

    // add bodies
    // var group = Body.nextGroup(true),
    //   length = 200,
    //   width = 25;

    const widgetCenter = { x: 150, y: 400 };
    const baseHeight = 100;

    // const toothWidth = 30;
    const toothRadius = 60;
    const toothSpacing = 275;
    const toothIntervalX = toothSpacing + toothRadius * 2;
    const staticWallWidth = 200;

    // const toothClampWallHeight = 400;
    const toothClampWallWidth = 200;
    const heavyTopToothRadius = 150;

    const sliderSideClampHeight = 300;

    const selections = 6;
    const selection = 0;
    const friction = 0.5;

    // const collidingGroup = Body.nextGroup(true);
    const nonCollidingGroup = Body.nextGroup(false);

    // Widget sliding base
    const baseWidth = (selections + 1) * toothIntervalX;

    var slidingBaseBody = Bodies.rectangle(
      widgetCenter.x +
        baseWidth / 2 -
        toothIntervalX -
        selection * toothIntervalX +
        toothIntervalX,
      widgetCenter.y + baseHeight / 2 + toothRadius,
      baseWidth,
      baseHeight,
      {
        // friction,
        // frictionStatic: 0.1,
        friction: 0.001,
        restitution: 0,
        collisionFilter: { group: nonCollidingGroup },
        chamfer: { radius: 10 },
        render: { fillStyle: fillStyleBlocks },
      }
    );
    setBody(slidingBaseBody);
    // console.log('slidingBaseBody.position.x', slidingBaseBody.position.x);

    // add clamps to the sides of the base slider
    // left
    const toothClampWallHeight = toothClampWallWidth * 3;
    var slidingBaseClampLeft = Bodies.rectangle(
      slidingBaseBody.position.x - baseWidth / 2 - toothClampWallWidth / 2 - toothSpacing,
      slidingBaseBody.position.y - (sliderSideClampHeight / 2 + baseHeight),
      toothClampWallWidth,
      toothClampWallHeight,
      {
        friction: 0,
        restitution: 0,
        inertia: Infinity,
        collisionFilter: { group: nonCollidingGroup },
        chamfer: { radius: 10 },
        render: { fillStyle: fillStyleBlocks },
      }
    );
    Composite.add(
      world,
      Constraint.create({
        bodyA: slidingBaseBody,
        pointA: {
          x: -(baseWidth / 2) - toothClampWallWidth / 2 - toothSpacing,
          y: -(sliderSideClampHeight / 2 + baseHeight),
        },
        pointB: { x: 0, y: 0 },
        bodyB: slidingBaseClampLeft,
      })
    );

    // right
    var slidingBaseClampRight = Bodies.rectangle(

      // slidingBaseBody.position.x - baseWidth / 2 - toothClampWallWidth / 2,
      // slidingBaseBody.position.y - (sliderSideClampHeight / 2 + baseHeight),
      // toothClampWallWidth,
      // toothClampWallHeight,


      slidingBaseBody.position.x + baseWidth / 2 + toothClampWallWidth / 2,
      slidingBaseBody.position.y - (sliderSideClampHeight / 2 + baseHeight),
      toothClampWallWidth,
      toothClampWallHeight,
      {
        // friction,
        friction: 0,
        restitution: 0,
        inertia: Infinity,
        collisionFilter: { group: nonCollidingGroup },
        chamfer: { radius: 10 },
        render: { fillStyle: fillStyleBlocks },
      }
    );
    Composite.add(
      world,
      Constraint.create({
        bodyA: slidingBaseBody,
        pointA: {
          x: (baseWidth / 2) + toothClampWallWidth / 2,
          y: -(sliderSideClampHeight / 2 + baseHeight),
        },
        pointB: { x: 0, y: 0 },
        bodyB: slidingBaseClampRight,
      })
    );

    // FAILS:
    // don't let it move up/down
    // Events.on(engine, 'beforeUpdate', function(event) {
    //     slidingBaseBody.position.y = widgetCenter.y + 10;
    // });

    // const teethHeightOffsetY = (toothRadius );
    const teethOptions = {
      friction,
      mass: 5,
      inertia: Infinity,
      restitution: 0,
      render: { fillStyle: fillStyleTeeth },
      collisionFilter: { group: nonCollidingGroup },
    };
    const teeth = [...Array(selections)].map((_, i) => {

      var tooth = Bodies.circle(
        widgetCenter.x +
          toothIntervalX * i -
          selection * toothIntervalX +
          toothIntervalX,
        widgetCenter.y,
        toothRadius,
        teethOptions,
      );
      if (rectOverCircleTeeth) {

        tooth = Bodies.rectangle(
          widgetCenter.x +
          toothIntervalX * i -
          selection * toothIntervalX +
          toothIntervalX,
          widgetCenter.y,
          toothRadius * 2,
          toothRadius,
          teethOptions
          );
        }

      const toothConstraint = Constraint.create({
        bodyA: slidingBaseBody,
        pointA: {
          x: -baseWidth / 2 + toothIntervalX * i + toothIntervalX,
          y: -toothRadius - baseHeight / 2,
        },
        pointB: { x: 0, y: 0 },
        bodyB: tooth,
      });

      Composite.add(world, toothConstraint);
      return tooth;
    });

    // The other main tooth
    var topTooth = Bodies.circle(
      widgetCenter.x + toothIntervalX / 2,
      widgetCenter.y - toothRadius - toothRadius * 2 - heavyTopToothRadius / 2, // - (heavyTopToothRadius + baseHeight / 2 + 60),
      heavyTopToothRadius,
      {
        mass: 100,
        inertia: Infinity,
        restitution: 0,
        friction: 0,
        render: { fillStyle: fillStyleTeeth },
      }
    );

    // Composite.add(
    //   world,
    //   Constraint.create({
    //     pointA: { x: topTooth.position.x, y: topTooth.position.y },
    //     pointB: { x: 0, y: 0 },
    //     bodyB: topTooth,
    //     stiffness: 0.2,
    //     length: 60,
    //     damping: 0.1,
    //   })
    // );

    const walls = [
      // walls

      // upper tooth left block
      Bodies.rectangle(
        topTooth.position.x - heavyTopToothRadius - staticWallWidth / 2 - (rectOverCircleTeeth ? 10 : 0),
        widgetCenter.y - toothRadius * 2 - toothClampWallHeight / 2 - 2,
        toothClampWallWidth,
        toothClampWallHeight,
        {
          restitution: 0,
          isStatic: true,
          friction: 0,
          render: { fillStyle: fillStyleBlocks },
        }
      ),
      // upper tooth right block
      Bodies.rectangle(
        topTooth.position.x + heavyTopToothRadius + staticWallWidth / 2 + 2 + (rectOverCircleTeeth ? 10 : 0),
        widgetCenter.y - toothRadius * 2 - toothClampWallHeight / 2 - 2,
        toothClampWallWidth,
        toothClampWallHeight,
        {
          restitution: 0,
          isStatic: true,
          friction: 0,
          render: { fillStyle: fillStyleBlocks },
        }
      ),
      // upper tooth top block
      Bodies.rectangle(
        topTooth.position.x,
        widgetCenter.y - toothRadius * 2 - toothClampWallHeight - 2,
        toothClampWallWidth * 2 + heavyTopToothRadius * 2,
        staticWallWidth,
        {
          restitution: 0,
          isStatic: true,
          friction: 0,
          render: { fillStyle: fillStyleBlocks },
        }
      ),

      // slider top clamp left
      // Bodies.rectangle(
      //   widgetCenter.x - toothClampWallWidth - 10,
      //   widgetCenter.y + baseHeight / 2 + staticWallWidth / 2,
      //   4200,
      //   staticWallWidth,
      //   { isStatic: true, friction: 0, }
      // ),
    ];


    const sliderFloor = // slider base
      Bodies.rectangle(
        widgetCenter.x,
        slidingBaseBody.position.y + baseHeight / 2 + staticWallWidth / 2,
        7200,
        staticWallWidth,
        {
          restitution: 0,
          isStatic: true,
          friction: 0,
          render: { fillStyle: fillStyleBlocks },
        }
      );

    Composite.add(world, [
      ...teeth,
      ...walls,
      sliderFloor,
      topTooth,
      slidingBaseBody,
      slidingBaseClampLeft,
      slidingBaseClampRight,
    ]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });

    Composite.add(world, mouseConstraint);

    Matter.Events.on(engine, "beforeUpdate", function (event) {
      //Apply force
      if (forceRef.current !== 0) {
        // console.log('forceRef.current', forceRef.current);
        Matter.Body.applyForce(
          slidingBaseBody,
          { x: slidingBaseBody.position.x, y: slidingBaseBody.position.y },
          { x: 0.2 * forceRef.current, y: 0 }
        );
      }
    });
    const checkToothHeight = setInterval(() => {
      const relativeHeight = topTooth.position.y - widgetCenter.y;
      console.log("relativeHeight", relativeHeight);
      // if (relativeHeight < -100) {
      // widgetCenter
    }, 1000);

    // 📐📐📐📐📐📐📐📐📐📐📐📐📐
    // 📐📐 END ACTUAL CODE
    // 📐 BEGIN COMMON ENGINE INIT
    // keep the mouse in sync with rendering
    render.mouse = mouse;
    // fit the render viewport to the scene
    Render.lookAt(
      render,
      [
        ...teeth,
        ...walls,
        topTooth,
        slidingBaseClampLeft,
        slidingBaseClampRight,
        slidingBaseBody,
      ]
      //   , {

      //   {
      //   objects: [],
      //   // min: { x: 0, y: 0 },
      //   // max: { x: 2000, y: 600 },
      // }
    );
    // run the renderer
    Render.run(render);
    // create runner
    var runner = Runner.create();
    // run the engine
    Runner.run(runner, engine);
    // 📐 📐 📐 END PHYSICS CODE
    // 📐📐📐📐📐📐📐📐📐📐📐📐📐

    return () => {
      Runner.stop(runner);
      Render.stop(render);
      setBody(null);
      clearInterval(checkToothHeight);
    };
  }, [setBody, forceRef]);

  const metaframeObject = useMetaframe();
  useEffect(() => {
    const metaframe = metaframeObject.metaframe;
    if (!metaframe || !body) {
      return;
    }
    const disposers: (() => void)[] = [];

    // const normalizer = createNormalizer(30, 1);
    // disposers.push(metaframe.onInput("input-rotation", (value: number) => {
    //   const valueNormalized = normalizer(value);
    //   forceRef.current = valueNormalized;
    // }));

    const rad = Math.PI / 180;
    disposers.push(
      metaframe.onInput("o", (orientation: number[]) => {
        var q = fromEuler(
          orientation[0] * rad,
          orientation[1] * rad,
          orientation[2] * rad,
          "ZXY"
        );
        // this returns values from [-0.02, 0.02]
        let yaw = yawFromQuaternion(q);
        // console.log('yaw', yaw);
        yaw = Math.max(Math.min(yaw, 0.028), -0.028);
        let forceNormalized = (yaw - -0.028) / (0.028 - -0.028);
        metaframe.setOutput("force", forceNormalized);
        forceNormalized = forceNormalized * 2 - 1;
        forceRef.current = forceNormalized;
        // console.log('forceNormalized', forceNormalized);
        // console.log('o-yaw', yaw);
      })
    );

    // disposers.push(metaframe.onInput("oa", (orientation: number[]) => {
    //   var q = fromEuler(orientation[0] * rad, orientation[1] * rad, orientation[2] * rad, 'ZXY');
    //   const yaw = yawFromQuaternion(q);
    //   // console.log('oa-yaw', yaw);
    // }));

    return () => {
      while (disposers.length > 0) {
        disposers.pop()?.();
      }
    };
  }, [metaframeObject?.metaframe]);

  const ref = useRef<HTMLDivElement>(null);

  return <div id="matter-js" ref={ref}></div>;
};

/**
 *
 * @returns [-1, 1]
 */

const createNormalizer = (valuesToCapture: number = 30, scale: number = 1) => {
  let min: number | null = null;
  let max: number | null = null;
  let count: number = 0;
  return (value: number): number => {
    count++;
    if (min === null) {
      min = value;
    }
    if (max === null) {
      max = value;
    }
    min = Math.min(min, value);
    max = Math.max(max, value);
    if (count < valuesToCapture) {
      return 0;
    }
    return (((value - min) / (max - min)) * 2 - 1) * scale;
  };
};

export interface OrientationPoint {
  qx: number;
  qy: number;
  qw: number;
  qz: number;
  // pitch:number;
  // roll:number;
  // yaw:number;
  // t:number;
}

export interface EulerPoint {
  // qx:number;
  // qy:number;
  // qw:number;
  // qz:number;
  pitch: number;
  roll: number;
  yaw: number;
  // t:number;
}

const yawFromQuaternion = (o: Quaternion): number => {
  // https://dulacp.com/2013/03/computing-the-ios-device-tilt.html
  // double yaw = asin(2*(quat.x*quat.z - quat.w*quat.y));
  const yaw = Math.asin(2 * (o.x * o.z - o.w * o.y));
  return yaw;
};
