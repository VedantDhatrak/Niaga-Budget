import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Modal,
    Animated,
    PanResponder,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_INITIAL_RATIO = 0.9;
const DEFAULT_MIN_RATIO = 0.25;
const DEFAULT_CLOSE_THRESHOLD_RATIO = 0.22;
const ANIMATION_DURATION = 280;
const SNAP_SPRING_CONFIG = { tension: 65, friction: 11 };

/**
 * A bottom sheet that:
 * - Opens with flexible height (default 90% of screen)
 * - Can be dragged by the handle to resize
 * - Closes when dragged below close threshold
 * - Uses smooth animations for open, resize snap, and close
 */
export function DraggableBottomSheet({
    visible,
    onClose,
    children,
    initialHeightRatio = DEFAULT_INITIAL_RATIO,
    minHeightRatio = DEFAULT_MIN_RATIO,
    closeThresholdRatio = DEFAULT_CLOSE_THRESHOLD_RATIO,
    sheetStyle,
    handleStyle,
}) {
    const initialHeight = SCREEN_HEIGHT * initialHeightRatio;
    const minHeight = SCREEN_HEIGHT * minHeightRatio;
    const maxHeight = SCREEN_HEIGHT * 0.98;
    const closeThreshold = SCREEN_HEIGHT * closeThresholdRatio;

    const heightAnim = useRef(new Animated.Value(0)).current;
    const lastHeightRef = useRef(initialHeight);
    const startHeightRef = useRef(initialHeight);
    const [exiting, setExiting] = useState(false);
    const closingByDragRef = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
            onPanResponderGrant: () => {
                startHeightRef.current = lastHeightRef.current;
            },
            onPanResponderMove: (_, gestureState) => {
                const dy = gestureState.dy;
                const newHeight = Math.min(
                    maxHeight,
                    Math.max(minHeight, startHeightRef.current - dy)
                );
                heightAnim.setValue(newHeight);
                lastHeightRef.current = newHeight;
            },
            onPanResponderRelease: (_, gestureState) => {
                const dy = gestureState.dy;
                const currentHeight = Math.min(
                    maxHeight,
                    Math.max(minHeight, startHeightRef.current - dy)
                );
                lastHeightRef.current = currentHeight;

                if (currentHeight <= closeThreshold) {
                    closingByDragRef.current = true;
                    Animated.timing(heightAnim, {
                        toValue: 0,
                        duration: ANIMATION_DURATION,
                        useNativeDriver: false,
                    }).start(() => {
                        onClose();
                    });
                } else {
                    const snapHeight = Math.max(minHeight, currentHeight);
                    lastHeightRef.current = snapHeight;
                    Animated.spring(heightAnim, {
                        toValue: snapHeight,
                        useNativeDriver: false,
                        ...SNAP_SPRING_CONFIG,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            setExiting(false);
            closingByDragRef.current = false;
            lastHeightRef.current = initialHeight;
            heightAnim.setValue(0);
            Animated.spring(heightAnim, {
                toValue: initialHeight,
                useNativeDriver: false,
                ...SNAP_SPRING_CONFIG,
            }).start();
        } else {
            if (closingByDragRef.current) {
                closingByDragRef.current = false;
                setExiting(false);
                return;
            }
            setExiting(true);
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
            }).start(() => {
                setExiting(false);
                onClose();
            });
        }
    }, [visible, initialHeight]);

    if (!visible && !exiting) return null;

    return (
        <Modal
            visible={visible || exiting}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.sheet,
                        sheetStyle,
                        {
                            height: heightAnim,
                        },
                    ]}
                >
                    <View
                        style={[styles.handleWrap, handleStyle]}
                        {...panResponder.panHandlers}
                    >
                        <View style={styles.handle} />
                    </View>
                    <View style={styles.content}>{children}</View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#121318',
    },
    handleWrap: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#BBBBBB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 24,
        minHeight: 0,
    },
});
